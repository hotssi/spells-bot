const fs = require('fs');

const path = '/home/ubuntu/spells-bot/src/index.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/return JSON\.parse\(/g, '// eslint-disable-next-line @typescript-eslint/no-unsafe-return\n      return JSON.parse(');

fs.writeFileSync(path, code);
