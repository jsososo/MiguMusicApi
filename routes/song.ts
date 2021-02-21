module.exports = {
  async ['/']({ req, res, songSaver, getBatchSong, request}) {
    const { cid } = req.query;
    if (!cid) {
      return res.send({
        result: 500,
        errMsg: '有参数没传呀小老弟',
      })
    }

    let song:Validation.SongInfo = (await getBatchSong([cid], request))[0];
    song = await songSaver.query(cid, song);
    return res ? res.send(
      {
        result: 100,
        data: song,
      }
    ) : song;
  },

  async ['/url']({ req, res, songSaver }) {
    const { cid, flac = '0' ,isRedirect = '0' } = req.query;
    if (!cid) {
      return res.send({
        result: 500,
        errMsg: '有参数没传呀小老弟',
      })
    }
    const info:Validation.SongInfo = await songSaver.query(cid);

    let url = info.url || '';
    if (flac/1) {
      url = info.flac || url;
    }
    if (isRedirect/1) {
      return res.redirect(url);
    }
    return res.send({
      result: 100,
      data: url,
    })
  },

  async ['/find']({ req, res, request, songSaver, getBatchSong }) {
    const { keyword, duration = 0 } = req.query;
    if (!keyword) {
      return res.send({
        result: 500,
        errMsg: '搜啥呢？',
      })
    }
    const search = require('./search')['/'];
    const songRes = await search({ req: { query: { keyword }}, request }).catch(() => ({}));
    let s:Validation.SongInfo;
    if ((songRes.list || []).length) {
      if (duration/1) {
        const cids = songRes.list.splice(0, 5).map(({ cid }) => cid);
        const list = await getBatchSong(cids, request);
        s = list.find(({ duration: d }) => d <= (duration/1 + 3) && d >= (duration - 3));
      } else {
        s = songRes.list[0];
      }
    }
    s && s.cid && (s = await songSaver.query(s.cid, s));

    return res ? res.send({
      result: 100,
      data: s,
    }) : s
  },
};
