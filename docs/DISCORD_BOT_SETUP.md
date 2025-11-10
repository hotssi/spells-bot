# Discord 봇 설정 가이드

## 📋 목차

1. [봇 생성하기](#봇-생성하기)
2. [필수 권한 설정](#필수-권한-설정)
3. [Intents 설정](#intents-설정)
4. [봇 초대하기](#봇-초대하기)
5. [환경 변수 설정](#환경-변수-설정)
6. [트러블슈팅](#트러블슈팅)

---

## 🤖 봇 생성하기

### 1단계: Discord Developer Portal 접속

1. https://discord.com/developers/applications 접속
2. "New Application" 클릭
3. 봇 이름 입력 (예: "Spells Bot")
4. "Create" 클릭

### 2단계: 봇 생성

1. 왼쪽 메뉴에서 "Bot" 클릭
2. "Add Bot" 클릭
3. "Yes, do it!" 확인

### 3단계: 토큰 복사

```
⚠️ 중요: 토큰은 절대 공개하지 마세요!
```

1. "Reset Token" 클릭 (또는 처음이면 자동으로 표시)
2. "Copy" 버튼으로 토큰 복사
3. `.env` 파일에 저장

```env
DISCORD_TOKEN=your_copied_token_here
```

### 4단계: Client ID 복사

1. 왼쪽 메뉴에서 "General Information" 클릭
2. "Application ID" 복사
3. `.env` 파일에 저장

```env
DISCORD_CLIENT_ID=your_application_id_here
```

---

## 🔐 필수 권한 설정

### Bot Permissions (OAuth2 → URL Generator)

Spells Bot에 필요한 최소 권한:

#### ✅ 필수 권한 (Bot Permissions)

```
□ Read Messages/View Channels
□ Send Messages
□ Send Messages in Threads
□ Embed Links
□ Attach Files
□ Read Message History
□ Add Reactions
□ Use Slash Commands
```

#### 권한 값 (계산기)

만약 수동으로 계산해야 한다면:

- Read Messages/View Channels: `1024`
- Send Messages: `2048`
- Embed Links: `16384`
- Attach Files: `32768`
- Read Message History: `65536`
- Add Reactions: `64`
- Use Slash Commands: `2147483648`

**총합**: `2147600384`

#### OAuth2 URL Generator에서 선택

1. 왼쪽 메뉴 "OAuth2" → "URL Generator"
2. **Scopes** 선택:
   - ✅ `bot`
   - ✅ `applications.commands`

3. **Bot Permissions** 선택:
   - ✅ Read Messages/View Channels
   - ✅ Send Messages
   - ✅ Send Messages in Threads
   - ✅ Embed Links
   - ✅ Attach Files
   - ✅ Read Message History
   - ✅ Add Reactions
   - ✅ Use Slash Commands

4. 하단에 생성된 URL 복사

---

## 🎯 Intents 설정

### Gateway Intents (Bot 메뉴)

#### ✅ 필수 Intents

```
□ GUILDS
□ GUILD_MESSAGES
□ MESSAGE_CONTENT (Privileged Intent)
```

### Privileged Intents 활성화

`MESSAGE_CONTENT` Intent는 특별 권한이 필요해요.

1. "Bot" 메뉴로 이동
2. "Privileged Gateway Intents" 섹션 찾기
3. 다음 항목들 활성화:
   - ✅ **Presence Intent** (선택사항 - 사용자 상태 확인)
   - ✅ **Server Members Intent** (선택사항 - 멤버 정보)
   - ✅ **Message Content Intent** ⚠️ **필수!**

```
⚠️ Message Content Intent는 2022년 9월부터 필수입니다!
활성화하지 않으면 메시지 내용을 읽을 수 없어요.
```

### 봇이 100개 이상 서버에 있을 경우

- 봇이 **75개 이상** 서버에 있으면 Privileged Intents 신청 필요
- Discord 팀 검토 후 승인 (보통 1-3일 소요)
- https://support.discord.com/hc/en-us/articles/360040720412

---

## 🎪 봇 초대하기

### 개발 서버 초대 (권장)

1. **테스트용 Discord 서버 생성**
   - Discord 앱에서 서버 생성
   - 이름: "Bot Testing" 등

2. **서버 ID 복사**
   - 서버 설정 → 위젯 → 서버 ID 복사
   - 또는 개발자 모드 켜고 서버 우클릭 → "ID 복사"

3. **환경 변수에 추가**
   ```env
   DISCORD_GUILD_ID=your_server_id_here
   ```

   ```
   💡 GUILD_ID를 설정하면 명령어가 즉시 적용됩니다!
   (글로벌 명령어는 최대 1시간 소요)
   ```

### 초대 URL 생성

#### 방법 1: URL Generator (추천)

1. Developer Portal → OAuth2 → URL Generator
2. Scopes 및 Permissions 선택 (위 참조)
3. 생성된 URL 복사
4. 브라우저에서 URL 열기
5. 서버 선택 후 "승인"

#### 방법 2: 수동 URL 생성

```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=PERMISSIONS&scope=bot%20applications.commands
```

**예시:**
```
https://discord.com/api/oauth2/authorize?client_id=1234567890&permissions=2147600384&scope=bot%20applications.commands
```

---

## ⚙️ 환경 변수 설정

### .env 파일 생성

프로젝트 루트에 `.env` 파일 생성:

```bash
cp .env.example .env
nano .env
```

### 필수 환경 변수

```env
# Discord Bot Configuration
DISCORD_TOKEN=YOUR_BOT_TOKEN_HERE
DISCORD_CLIENT_ID=YOUR_APPLICATION_ID_HERE
DISCORD_GUILD_ID=YOUR_TEST_SERVER_ID_HERE  # 개발용 (선택사항)

# n8n Webhooks
N8N_WEBHOOK_BASE_URL=https://n8n.sonagi.space/webhook
N8N_SNIPPET_WEBHOOK=discord-snippet
N8N_COMPONENT_WEBHOOK=component-browser
N8N_BACKGROUND_WEBHOOK=background-search

# Bot Configuration
LOG_LEVEL=info
NODE_ENV=development
```

### 환경 변수 검증

```bash
# .env 파일 내용 확인 (민감 정보 주의!)
cat .env | grep -v TOKEN | grep -v KEY
```

---

## 🎮 명령어 등록하기

### 개발 서버에 등록 (즉시 적용)

```bash
# 환경 변수 확인
echo $DISCORD_TOKEN
echo $DISCORD_CLIENT_ID
echo $DISCORD_GUILD_ID

# 명령어 배포
npm run deploy-commands
```

**출력 예시:**
```
🔄 Started refreshing 3 application (/) commands.
📍 Deploying to guild: 123456789012345678
✅ Successfully reloaded application (/) commands.
```

### 글로벌 등록 (1시간 소요)

`.env`에서 `DISCORD_GUILD_ID` 제거 또는 주석 처리:

```env
# DISCORD_GUILD_ID=123456789012345678
```

```bash
npm run deploy-commands
```

**출력 예시:**
```
🔄 Started refreshing 3 application (/) commands.
🌍 Deploying globally (may take up to 1 hour)
✅ Successfully reloaded application (/) commands.
```

---

## 🚨 트러블슈팅

### 문제 1: "Missing Access" 오류

**증상:**
```
DiscordAPIError: Missing Access
```

**원인:** 봇이 서버에 없거나 권한 부족

**해결:**
1. 봇이 서버에 초대되어 있는지 확인
2. 필수 권한이 있는지 확인
3. 봇 역할이 다른 역할보다 위에 있는지 확인

### 문제 2: "Invalid Token" 오류

**증상:**
```
Error: Invalid token
```

**원인:** 토큰이 잘못되었거나 만료됨

**해결:**
1. Developer Portal에서 토큰 재발급
2. `.env` 파일 업데이트
3. 앞뒤 공백 제거 확인

```bash
# 토큰 검증 (안전한 방법)
echo $DISCORD_TOKEN | wc -c
# 약 70-80자 정도 되어야 함
```

### 문제 3: 명령어가 나타나지 않음

**증상:** Discord에서 `/` 입력해도 명령어 안 보임

**원인:**
- 명령어 등록 안 됨
- 권한 부족
- Intents 미설정

**해결:**
```bash
# 1. 명령어 재등록
npm run deploy-commands

# 2. 봇 재시작
npm run dev
# 또는
docker compose restart spells-bot

# 3. Discord 클라이언트 재시작
# Ctrl+R (새로고침)

# 4. 개발 서버에서 먼저 테스트
# GUILD_ID 설정 확인
```

### 문제 4: "Missing Intents" 오류

**증상:**
```
Error: Used disallowed intents
```

**원인:** Privileged Intents 미활성화

**해결:**
1. Developer Portal → Bot 메뉴
2. "Privileged Gateway Intents" 섹션
3. 필요한 Intents 활성화
4. "Save Changes"

### 문제 5: MESSAGE_CONTENT 읽을 수 없음

**증상:** 메시지 내용이 빈 문자열

**원인:** Message Content Intent 미활성화

**해결:**
1. Bot 메뉴 → Privileged Gateway Intents
2. **Message Content Intent** 활성화 ⚠️
3. 봇 재시작

---

## 📚 권한 레퍼런스

### 권한 비트 값

| 권한 이름 | 비트 값 | 설명 |
|----------|---------|------|
| View Channels | `1024` | 채널 보기 |
| Send Messages | `2048` | 메시지 전송 |
| Embed Links | `16384` | 임베드 링크 |
| Attach Files | `32768` | 파일 첨부 |
| Read Message History | `65536` | 메시지 이력 읽기 |
| Add Reactions | `64` | 반응 추가 |
| Use Slash Commands | `2147483648` | 슬래시 명령어 사용 |

### 계산기

```javascript
// 권한 계산 예시
const permissions = 
  1024 +      // View Channels
  2048 +      // Send Messages
  16384 +     // Embed Links
  32768 +     // Attach Files
  65536 +     // Read Message History
  64 +        // Add Reactions
  2147483648; // Use Slash Commands

console.log(permissions); // 2147600384
```

### OAuth2 URL 템플릿

```
https://discord.com/api/oauth2/authorize
  ?client_id={CLIENT_ID}
  &permissions={PERMISSIONS}
  &scope=bot%20applications.commands
```

---

## ✅ 최종 체크리스트

봇 배포 전 확인사항:

### Discord Developer Portal
- [ ] 애플리케이션 생성
- [ ] 봇 추가
- [ ] 토큰 복사 및 저장
- [ ] Message Content Intent 활성화
- [ ] OAuth2 URL 생성

### 로컬 설정
- [ ] `.env` 파일 생성
- [ ] `DISCORD_TOKEN` 설정
- [ ] `DISCORD_CLIENT_ID` 설정
- [ ] `DISCORD_GUILD_ID` 설정 (개발용)
- [ ] 명령어 배포 완료
- [ ] 봇 실행 확인

### Discord 서버
- [ ] 테스트 서버 생성
- [ ] 봇 초대 완료
- [ ] 봇 온라인 상태 확인
- [ ] 명령어 나타남 확인
- [ ] 명령어 실행 테스트

---

## 🔗 추가 리소스

- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord.js 가이드](https://discordjs.guide/)
- [Discord API 문서](https://discord.com/developers/docs)
- [Permissions Calculator](https://discordapi.com/permissions.html)

---

## 💡 팁

### 개발 모드 vs 프로덕션 모드

**개발 모드** (권장):
```env
DISCORD_GUILD_ID=your_test_server_id
NODE_ENV=development
```
- 명령어 즉시 적용
- 테스트 서버에만 표시
- 빠른 반복 개발

**프로덕션 모드**:
```env
# DISCORD_GUILD_ID 제거
NODE_ENV=production
```
- 명령어 글로벌 등록 (1시간 소요)
- 모든 서버에서 사용 가능

### 권한 최소화 원칙

- ❌ Administrator 권한 요구하지 마세요
- ✅ 필요한 권한만 요청하세요
- ✅ 사용자에게 권한 설명 제공

### 보안 체크리스트

- [ ] 토큰을 Git에 커밋하지 않았는지 확인
- [ ] `.env`가 `.gitignore`에 있는지 확인
- [ ] 토큰이 공개 저장소에 없는지 확인
- [ ] 환경 변수로만 토큰 관리

```bash
# .gitignore 확인
cat .gitignore | grep .env
```

---

**마지막 업데이트**: 2025-11-08  
**문의**: 문제가 있다면 [GitHub Issues](https://github.com/hotssi/spells-bot/issues)에 올려주세요!
