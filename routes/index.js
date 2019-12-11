var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: '咪咕 音乐 api', content: '<a href="http://jsososo.gihub.io/MiguMusicApi">查看文档</a>' });
});

module.exports = router;
