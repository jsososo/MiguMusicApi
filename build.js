const fs = require('fs');
const path = require('path');

let routeString = `module.exports = {
`;

const blackSet = new Set(['index'])
fs.readdirSync(path.join(__dirname, 'dist/routes')).forEach(file => {
  const filename = file.replace(/\.js$/, '');
  if (!blackSet.has(filename)) {
    routeString += `  ${filename}: require('./routes/${filename}'),
`;
  }
})
routeString += `};
`;

fs.writeFileSync(path.join(__dirname, 'dist/routes.js'), routeString);
