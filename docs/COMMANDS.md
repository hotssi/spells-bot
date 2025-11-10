# Spells Bot Commands

통합 Discord 봇으로 개발 및 디자인 리소스에 빠르게 접근합니다.

## 📐 명령어 네이밍 규칙

### 규칙 1: 핵심 기능 = 1단어 명령어
사용 빈도가 높고, 단독으로 의미가 명확한 경우
```
예: /snippet, /component, /background
```

### 규칙 2: 특정 카테고리 = 서브커맨드
논리적으로 그룹핑이 필요하거나, 여러 하위 기능이 있는 경우
```
예: /design blur, /util qr
```

### 규칙 3: 별칭 사용 = 빠른 접근
자주 쓰이는 서브커맨드는 별칭으로도 제공
```
예: /blur → /design blur와 동일
```

---

## 📦 Core Commands (핵심 명령어)

### `/snippet [language?] [query]`
코드 스니펫 검색

**파라미터:**
- `query` (필수): 검색할 키워드 (예: promise, async)
- `language` (선택): 프로그래밍 언어 필터
  - JavaScript, TypeScript, Python, Go, Rust, Java, C++

**예시:**
```
/snippet query:promise
/snippet language:typescript query:async await
```

**출처:** CLI `meok` + Supabase  
**백엔드:** n8n webhook → `discord-snippet`

---

### `/component [framework] [name?] [category?]`
UI 컴포넌트를 StackBlitz로 열기

**파라미터:**
- `framework` (필수): 프레임워크 선택
  - React, Vue, Svelte, Vanilla
- `name` (선택): 컴포넌트 이름 (예: button, modal)
- `category` (선택): 카테고리 필터 (예: form, layout)

**예시:**
```
/component framework:react name:button
/component framework:vue category:form
```

**출처:** CLI `but` + hotssi/sandbox  
**백엔드:** n8n webhook → `component-browser`

---

### `/background [topic]`
디자인/개발 배경지식 검색

**파라미터:**
- `topic` (필수): 검색할 주제 (예: REST API, 타이포그래피)

**예시:**
```
/background topic:REST API
/background topic:타이포그래피
```

**출처:** CLI `jongi` + hotssi/background → 디지털 가든  
**백엔드:** n8n webhook → `background-search`

---

## 🎨 Design Category (디자인 도구)

### `/design blur [image] [intensity?]`
이미지에 블러 효과 적용

**파라미터:**
- `image` (필수): 이미지 URL
- `intensity` (선택): 블러 강도 (100-2000, 기본값: 800)

**예시:**
```
/design blur image:https://example.com/image.jpg
/design blur image:https://example.com/image.jpg intensity:1200
```

**출처:** DesignSpells 기존 기능  
**서비스:** Cloudinary

**빠른 접근 별칭:** `/blur`

---

### `/design styled-text [text] [style]`
텍스트 스타일링 (Discord 마크다운)

**파라미터:**
- `text` (필수): 스타일을 적용할 텍스트
- `style` (필수): 스타일 선택
  - bold, italic, underline, strikethrough
  - code, code-block, quote, spoiler

**예시:**
```
/design styled-text text:Hello World style:bold
/design styled-text text:Important style:spoiler
```

**출처:** DesignSpells 기존 기능

---

## 🔗 별칭 (Aliases)

### `/blur [image] [intensity?]`
→ `/design blur`의 빠른 접근 별칭

자주 사용하는 명령어를 더 빠르게 실행할 수 있습니다.

---

## 🚀 사용 팁

### 1. 자동완성 활용
Discord에서 `/`를 입력하면 사용 가능한 명령어 목록이 표시됩니다.

### 2. 검색 키워드 최적화
- **짧고 명확한 키워드** 사용
- **영어 키워드** 권장 (언어 무관하게 검색)
- **태그로 필터링** 활용

### 3. 언어 필터 활용
`/snippet`에서 언어 필터를 사용하면 더 정확한 결과를 얻을 수 있습니다.

### 4. 결과 제한
- `/snippet`: 최대 3개
- `/component`: 최대 5개
- `/background`: 최대 3개

더 많은 결과가 필요하면 검색 키워드를 구체화하세요.

---

## 🔧 향후 추가 예정

### Utility Category
- `/util qr [url]` - QR 코드 생성
- `/util short [url]` - URL 단축
- `/util exec-md [url-or-content]` - 마크다운 코드 블록 실행

### Resource Category
- `/resource api [service] [endpoint]` - API 엔드포인트 정보
- `/resource link [category] [query]` - 유용한 링크 모음

### Design Category
- `/design palette [color]` - 색상 팔레트 생성

---

## 📝 피드백 및 버그 제보

문제가 발생하거나 새로운 기능을 제안하고 싶다면:
- GitHub Issues: [hotssi/spells-bot](https://github.com/hotssi/spells-bot)
- Discord: @hotssi

---

**버전:** 1.0.0  
**마지막 업데이트:** 2025-11-07
