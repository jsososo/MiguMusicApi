const miguMusic = require('./dist/index').default;

miguMusic('search', { keyword: '周杰伦' })
  .then(res => console.log(res))
  .catch((err) => console.error('error: ', err.message))