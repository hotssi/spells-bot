# 🔧 n8n 워크플로우 설정 가이드

## 📋 문제 상황

기존 n8n 워크플로우는 **Discord 메시지** (`!snippet`) 형식을 파싱하도록 설계되어 있었습니다.
하지만 Discord Bot은 **HTTP API** 형식 (`{ query, language }`)으로 요청을 보냅니다.

## ✅ 해결 방법

새로운 워크플로우로 교체하거나, 기존 워크플로우를 수정해야 합니다.

---

## 🚀 옵션 1: 새 워크플로우 Import (추천)

### 1단계: n8n에서 기존 워크플로우 백업

1. n8n 대시보드 접속
2. `discord-snippet` 워크플로우 열기
3. **우측 상단 메뉴 (⋮) → Download** 클릭
4. JSON 파일로 백업 저장

### 2단계: 새 워크플로우 Import

1. n8n 대시보드에서 **Workflows → Import from File** 클릭
2. 프로젝트의 `n8n-workflow-fixed.json` 파일 선택
3. Import 완료

### 3단계: Credentials 재연결

Import 후 Supabase credential이 연결되어 있지 않을 수 있습니다:

1. **"Search All Languages"** 노드 클릭
2. **Credentials** 섹션에서 기존 "Supabase main" 선택
3. **"Search Specific Language"** 노드도 동일하게 설정

### 4단계: Webhook 경로 확인

1. **Webhook** 노드 클릭
2. **Path** 가 `discord-snippet` 인지 확인
3. **Production URL** 메모: `https://n8n.sonagi.space/webhook/discord-snippet`

### 5단계: 워크플로우 활성화

1. 우측 상단의 **Active** 토글 ON
2. 저장 버튼 클릭

---

## 🔨 옵션 2: 기존 워크플로우 수정

기존 워크플로우를 계속 사용하고 싶다면 다음 노드들을 수정하세요:

### 1. "Parse Message" 노드 → "Parse Request"로 변경

**기존 코드:**
```javascript
const body = $input.item.json.body;
const content = body.content || '';
// ... Discord 메시지 파싱 로직
```

**새 코드:**
```javascript
// Discord Bot API 요청 파싱
const body = $input.item.json.body;

// 요청 형식: { query: string, language?: string }
const query = body.query;
const language = body.language || null;

if (!query) {
  throw new Error('query parameter is required');
}

return [{
  json: {
    searchQuery: query,
    language: language
  }
}];
```

### 2. "Is Snippet Command?" 노드 → "Has Language Filter?"로 변경

**조건 변경:**
- 기존: `{{ $json.isCommand }}` == true
- 새: `{{ $json.language }}` exists (문자열 존재 여부)

### 3. Supabase 노드들 정리

**"Get many rows" 노드를 2개로 분리:**

#### A. "Search All Languages" (언어 필터 없음)
```
Operation: Get All
Table: snippets
Limit: 10
Filters:
  - search_vector (Full Text) wfts: {{ $json.searchQuery }}
```

#### B. "Search Specific Language" (언어 필터 있음)
```
Operation: Get All
Table: snippets
Limit: 10
Filters:
  - search_vector (Full Text) wfts: {{ $json.searchQuery }}
  - language (Equal) eq: {{ $json.language }}
```

### 4. "Format Response" 노드 수정

**기존 코드:** Discord Embed 형식 반환
**새 코드:** JSON 배열 반환

```javascript
// Supabase 검색 결과를 Discord Bot API 형식으로 변환
const results = $input.all();

if (results.length === 0) {
  return [{ json: [] }];
}

// 스니펫 형식으로 변환
const snippets = results.map(item => {
  const data = item.json;

  return {
    id: data.id || '',
    title: data.title || 'Untitled',
    language: data.language || 'unknown',
    code: data.code || data.code_preview || '',
    description: data.description || '',
    tags: data.tags || [],
    category: data.category || ''
  };
});

return [{ json: snippets }];
```

### 5. Discord 노드 제거, Respond to Webhook 추가

1. **Discord 노드 삭제**
2. **"Respond to Webhook" 노드 추가**
   - Type: Respond to Webhook
   - Respond With: JSON
   - Response Body: `{{ $json }}`

3. **Format Response → Respond to Webhook** 연결

---

## 🧪 테스트

### 1. n8n에서 테스트

1. **Webhook 노드** 클릭
2. **Test step** 클릭
3. **Listen for test event** 활성화
4. 터미널에서:

```bash
cd /mnt/c/Users/hoofo/Downloads/spells-bot/spells-bot
node test-n8n.js
```

**기대 결과:**
```json
[
  {
    "id": "...",
    "title": "Promise 예제",
    "language": "javascript",
    "code": "const promise = ...",
    "description": "...",
    "tags": ["async", "promise"],
    "category": "async"
  }
]
```

### 2. Discord Bot에서 테스트

```bash
npm run dev
```

Discord에서:
```
/snippet query:promise language:JavaScript
```

**예상 결과:**
- 3개의 스니펫 Embed 표시
- 제목, 언어, 코드 미리보기 포함

---

## 🔍 트러블슈팅

### 문제: "검색 결과가 없습니다"

**원인 1: Supabase 테이블 구조 불일치**
```sql
-- Supabase에서 snippets 테이블 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'snippets';
```

필수 컬럼:
- `id` (text/uuid)
- `title` (text)
- `language` (text)
- `code` or `code_preview` (text)
- `search_vector` (tsvector) - Full Text Search용

**원인 2: Full Text Search 설정 누락**

Supabase에서 `search_vector` 컬럼이 없다면:
```sql
-- search_vector 컬럼 추가
ALTER TABLE snippets
ADD COLUMN search_vector tsvector;

-- 자동 업데이트 트리거 생성
CREATE OR REPLACE FUNCTION snippets_search_update()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.code, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER snippets_search_vector_update
BEFORE INSERT OR UPDATE ON snippets
FOR EACH ROW EXECUTE FUNCTION snippets_search_update();

-- 인덱스 생성
CREATE INDEX snippets_search_idx ON snippets USING GIN(search_vector);
```

**원인 3: 데이터 없음**

테스트 데이터 삽입:
```sql
INSERT INTO snippets (title, language, code, description, category)
VALUES
  (
    'Promise 기본 예제',
    'javascript',
    'const promise = new Promise((resolve, reject) => {\n  // 비동기 작업\n  resolve("성공");\n});',
    'JavaScript Promise 기본 사용법',
    'async'
  ),
  (
    'Async/Await 예제',
    'javascript',
    'async function fetchData() {\n  const data = await fetch(url);\n  return data.json();\n}',
    'Async/Await을 사용한 비동기 처리',
    'async'
  );
```

### 문제: n8n 타임아웃

**`.env` 파일 타임아웃 조정:**
```env
# 기본 10초
# 타임아웃: 10000ms
```

**n8n 노드 타임아웃 늘리기:**
1. Supabase 노드 클릭
2. Settings → Options → Timeout
3. 30000 (30초)로 변경

---

## 📊 응답 형식 요약

### Discord Bot → n8n (요청)
```json
{
  "query": "promise",
  "language": "javascript"
}
```

### n8n → Discord Bot (응답)
```json
[
  {
    "id": "uuid",
    "title": "제목",
    "language": "javascript",
    "code": "코드 내용",
    "description": "설명",
    "tags": ["tag1", "tag2"],
    "category": "카테고리"
  }
]
```

또는 빈 배열:
```json
[]
```

---

## ✨ 완료!

이제 `/snippet` 명령어가 정상적으로 작동해야 합니다.

**다음 단계:**
1. `/component` 명령어도 동일한 방식으로 수정
2. `/background` 명령어도 동일한 방식으로 수정
