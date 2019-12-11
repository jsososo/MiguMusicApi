module.exports = {
  async ['/url']({ req, res, request, UrlSaver }) {
    const { cid, id, type, url, needPic = '0' } = req.query;
    if (!id || !cid) {
      return res.send({
        result: 500,
        errMsg: '有参数没传呀小老弟',
      })
    }

    let saveInfo: Validation.SongUrlMap = UrlSaver.get(id);
    // 如果都能对得上，那就开启强制请求
    if (type && url && UrlSaver.check(id, type, url)) {
      saveInfo = undefined;
    }

    if (saveInfo) {
      if (!Number(needPic)) {
        delete saveInfo.pic;
        delete saveInfo.bgPic;
      }
      return res.send({
        result: 100,
        data: saveInfo,
      });
    }

    const result = await UrlSaver.query(id, cid);

    if (!Number(needPic)) {
      delete result.pic;
      delete result.bgPic;
    }

    return res.send({
      result: 100,
      data: result,
    });
  },

  async ['/url/save']({ res, UrlSaver }) {
    UrlSaver.write();

    res.send({
      result: 100,
      data: '就当成功了吧!'
    })
  },

  async ['/find']({ req, res, request, UrlSaver }) {
    const { keyword } = req.query;
    if (!keyword) {
      return res.send({
        result: 500,
        errMsg: '搜啥呢？',
      })
    }
    const songRes = await request.send(`http://127.0.0.1:3400/search?keyword=${keyword}`);
    let songInfo;
    let urlInfo;
    if (songRes && songRes.data && songRes.data.list && songRes.data.list.length > 0) {
      songInfo = songRes.data.list[0];
      const { id, cid } = songInfo;
      urlInfo = UrlSaver.get(id);
      if (!urlInfo) {
        urlInfo = await UrlSaver.query(id, cid);
      }
      songInfo = { ...songInfo, ...urlInfo };
    }

    res.send({
      result: 100,
      data: songInfo,
    })

  },
};
