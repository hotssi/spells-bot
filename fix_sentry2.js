const fs = require('fs');

const path = '/home/ubuntu/spells-bot/src/index.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/return JSON\.parse\(eventString\.replace\(new RegExp\(process\.env\.DISCORD_TOKEN, 'g'\), '\[FILTERED_TOKEN\]'\)\);/g, "return JSON.parse(eventString.replace(new RegExp(process.env.DISCORD_TOKEN, 'g'), '[FILTERED_TOKEN]')) as Sentry.Event;");

fs.writeFileSync(path, code);
