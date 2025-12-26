const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dir = './src/environments';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const content = `
export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL}'
};
`;

fs.writeFileSync(path.join(dir, 'environment.ts'), content);
fs.writeFileSync(path.join(dir, 'environment.development.ts'), content);

console.log('Environment files generated successfully.');
