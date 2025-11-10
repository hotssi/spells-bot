# ✨ Spells Bot

통합 Discord 봇으로 개발 및 디자인 리소스에 빠르게 접근하세요.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Discord.js](https://img.shields.io/badge/Discord.js-5865F2?style=flat&logo=discord&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)

## 🎯 기능

### 📦 핵심 명령어
- **`/snippet`** - 코드 스니펫 검색 (Supabase 연동)
- **`/component`** - UI 컴포넌트 검색 및 StackBlitz로 열기
- **`/background`** - 디자인/개발 배경지식 검색

### 🎨 디자인 도구
- **`/design blur`** - 이미지 블러 효과 (Cloudinary)
- **`/design styled-text`** - 텍스트 스타일링
- **`/blur`** - 블러 효과 빠른 접근 (별칭)

### 📚 더 자세한 명령어 설명
[📖 COMMANDS.md](./docs/COMMANDS.md) 문서를 참고하세요.

---

## 🚀 Quick Start

### 1. 사전 준비

#### 필수 요구사항
- Node.js 18 이상
- npm 8 이상
- Discord Bot Token
- n8n 인스턴스 (웹훅용)

#### 선택 요구사항
- Cloudinary 계정 (이미지 처리)
- Supabase 프로젝트 (직접 조회용)

### 2. 설치

```bash
# 저장소 클론
git clone https://github.com/hotssi/spells-bot.git
cd spells-bot

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어서 필요한 값 입력
```

### 3. 환경 변수 설정

`.env` 파일에 다음 값들을 설정하세요:

```env
# Discord (필수)
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_client_id
DISCORD_GUILD_ID=your_guild_id  # 개발용

# n8n Webhooks (필수)
N8N_WEBHOOK_BASE_URL=https://n8n.sonagi.space/webhook
N8N_SNIPPET_WEBHOOK=discord-snippet
N8N_COMPONENT_WEBHOOK=component-browser
N8N_BACKGROUND_WEBHOOK=background-search

# Cloudinary (선택 - /design blur 사용 시)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# StackBlitz (기본값 제공)
STACKBLITZ_BASE_URL=https://stackblitz.com/edit
```

### 4. Discord 명령어 등록

```bash
# 개발 환경 (특정 길드에만 등록, 즉시 적용)
npm run deploy-commands

# 프로덕션 (글로벌 등록, 최대 1시간 소요)
# DISCORD_GUILD_ID를 .env에서 제거한 후
npm run deploy-commands
```

### 5. 봇 실행

```bash
# 개발 모드 (파일 변경 시 자동 재시작)
npm run dev

# 프로덕션 빌드 및 실행
npm run build
npm start
```

---

## 🏗️ 프로젝트 구조

```
spells-bot/
├── src/
│   ├── commands/              # 명령어
│   │   ├── core/             # 핵심 1단어 명령어
│   │   ├── design/           # 디자인 서브커맨드
│   │   └── aliases/          # 빠른 접근 별칭
│   ├── services/             # 외부 서비스 통합
│   │   ├── n8n.service.ts
│   │   ├── cloudinary.service.ts
│   │   └── stackblitz.service.ts
│   ├── utils/                # 유틸리티
│   │   ├── logger.ts
│   │   ├── error-handler.ts
│   │   └── embed-builder.ts
│   ├── types/                # TypeScript 타입
│   ├── events/               # Discord 이벤트 핸들러
│   └── index.ts              # 메인 엔트리포인트
├── scripts/
│   └── deploy-commands.ts    # 명령어 배포 스크립트
├── docs/
│   └── COMMANDS.md           # 명령어 문서
└── package.json
```

---

## 🔧 개발 가이드

### 새 명령어 추가하기

1. **명령어 파일 생성**

```typescript
// src/commands/core/mycommand.ts
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types/commands';

export const mycommand: Command = {
  data: new SlashCommandBuilder()
    .setName('mycommand')
    .setDescription('My command description'),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply('Hello!');
  },
};
```

2. **index.ts에 등록**

```typescript
import { mycommand } from './commands/core/mycommand';

const commands: CommandMap = new Map([
  // ... 기존 명령어
  [mycommand.data.name, mycommand],
]);
```

3. **배포 스크립트에 추가**

```typescript
// scripts/deploy-commands.ts
import { mycommand } from '../src/commands/core/mycommand';

const commands = [
  // ... 기존 명령어
  mycommand.data.toJSON(),
];
```

4. **명령어 배포**

```bash
npm run deploy-commands
```

### 코드 스타일

```bash
# Lint
npm run lint

# Format
npm run format
```

---

## 🐳 Docker 배포

### Dockerfile

```bash
# 빌드
docker build -t spells-bot .

# 실행
docker run -d \
  --name spells-bot \
  --env-file .env \
  --restart unless-stopped \
  spells-bot
```

### Docker Compose

```bash
# 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down
```

---

## 🔗 n8n 웹훅 설정

Spells Bot은 n8n 웹훅을 통해 Supabase 데이터를 조회합니다.

### 필요한 n8n 워크플로우

1. **discord-snippet** - 스니펫 검색
2. **component-browser** - 컴포넌트 검색  
3. **background-search** - 배경지식 검색

### 웹훅 응답 형식

```typescript
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "...",
      // ... 결과 데이터
    }
  ]
}
```

자세한 n8n 설정은 [n8n_워크플로우_템플릿.md](./docs/n8n_workflows.md)를 참고하세요.

---

## 📊 성능 최적화

### 메모리 사용량
- **목표:** 100-200MB
- **최대:** 400MB

### 응답 시간
- **목표:** < 2초
- **타임아웃:** 10초

### 리소스 제한 (Docker)
```yaml
services:
  spells-bot:
    mem_limit: 512m
    mem_reservation: 256m
    cpus: 0.5
```

---

## 🐛 트러블슈팅

### 명령어가 나타나지 않아요
```bash
# 명령어 재배포
npm run deploy-commands

# 글로벌 명령어는 최대 1시간 소요
# 개발 중에는 DISCORD_GUILD_ID를 설정하여 즉시 적용
```

### n8n 웹훅 오류
```bash
# 환경 변수 확인
echo $N8N_WEBHOOK_BASE_URL

# 웹훅 URL 테스트
curl -X POST https://n8n.sonagi.space/webhook/discord-snippet \
  -H "Content-Type: application/json" \
  -d '{"query":"test"}'
```

### Cloudinary 업로드 실패
```bash
# API 키 확인
echo $CLOUDINARY_API_KEY

# 이미지 URL 유효성 검증
# - http:// 또는 https:// 로 시작해야 함
# - 접근 가능한 공개 URL이어야 함
```

---

## 📝 라이선스

MIT License

---

## 🤝 기여하기

Pull Request는 언제나 환영입니다!

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📮 연락처

- GitHub: [@hotssi](https://github.com/hotssi)
- Discord: @hotssi

---

**Made with ❤️ by hotssi**
