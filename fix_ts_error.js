const fs = require('fs');

const path = '/home/ubuntu/spells-bot/src/index.ts';
let code = fs.readFileSync(path, 'utf8');

const oldCode = `    const eventString = JSON.stringify(event);
    if (eventString.includes(process.env.DISCORD_TOKEN || '')) {
      // 이 부분은 보안상 매우 중요하므로 토큰값이 로깅되지 않게 처리
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return JSON.parse(
        eventString.replace(new RegExp(process.env.DISCORD_TOKEN, 'g'), '[FILTERED_TOKEN]')
      );
    }`;

const newCode = `    const eventString = JSON.stringify(event);
    const token = process.env.DISCORD_TOKEN;
    if (token && eventString.includes(token)) {
      // 이 부분은 보안상 매우 중요하므로 토큰값이 로깅되지 않게 처리
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return JSON.parse(eventString.replace(new RegExp(token, 'g'), '[FILTERED_TOKEN]'));
    }`;

code = code.replace(oldCode, newCode);

fs.writeFileSync(path, code);
