const fs = require('fs');

const path = '/home/ubuntu/spells-bot/src/index.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/const error = hint\.originalException;/g, 'const error = hint.originalException as Error;');

fs.writeFileSync(path, code);
