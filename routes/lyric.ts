module.exports = {
  async ['/']({ req, res, request }) {
    const { cid } = req.query;

    if (!cid) {
      return res.send({
        result: 500,
        errMsg: 'cid呢小老弟',
      })
    }

    const result = await request.send(`http://music.migu.cn/v3/api/music/audioPlayer/getLyric?copyrightId=${cid}`);

    if (result.msg === '成功') {
      return res.send({
        result: 100,
        data: result.lyric,
      });
    }

    return res.send({
      result: 200,
      errMsg: result.msg,
    });
  },
};
