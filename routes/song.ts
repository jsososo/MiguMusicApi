module.exports = {
  async ['/']({ req, res, request }) {
    const { id, type = '128' } = req.query;
    if (!id) {
      return res.send({
        result: 500,
        errMsg: '有参数没传呀小老弟',
      })
    }

    const result = await request.send({
      url: 'http://app.c.nf.migu.cn/MIGUM2.0/v2.0/content/listen-url',
      data: {
        netType: '01',
        resourceType: 'E',
        songId: id,
        toneFlag: {
          128: 'PQ',
          320: 'HQ',
          flac: 'SQ',
        }[type],
        dataType: 2,
        // data: c,
        // secKey: f,
      },
      headers: {
        referer: 'http://music.migu.cn/v3/music/player/audio',
        channel: '0146951',
        uid: 1234,
      }
    });
    if (!result || result.code !== '000000') {
      return res.send({
        result: 200,
        errMsg: result.info,
      })
    }
    const { songItem } = result.data;
    const { songName, songId, copyrightId, artists, album, albumId, albumImgs, songDescs, singerImg } = songItem;

    return res.send({
      result: 100,
      data: {
        name: songName,
        id: songId,
        cid: copyrightId,
        artists: artists.map((o) => ({
          ...o,
          picUrl: singerImg[o.id].img,
        })),
        album: {
          name: album,
          id: albumId,
          picUrl: albumImgs[0] && albumImgs[0].img,
        },
        desc: songDescs,
        url: result.data.url,
      }
    });
  },

  async ['/url']({ req, res, request }) {
    const { id, type = '128', isRedirect = '0' } = req.query;
    if (!id) {
      return res.send({
        result: 500,
        errMsg: '有参数没传呀小老弟',
      })
    }

    const result = await request.send({
      url: 'http://app.c.nf.migu.cn/MIGUM2.0/v2.0/content/listen-url',
      data: {
        netType: '01',
        resourceType: 'E',
        songId: id,
        toneFlag: {
          128: 'PQ',
          320: 'HQ',
          flac: 'SQ',
        }[type],
        dataType: 2,
        // data: c,
        // secKey: f,
      },
      headers: {
        referer: 'http://music.migu.cn/v3/music/player/audio',
        channel: '0146951',
        uid: 1234,
      }
    });

    if (result.code === '000000') {
      if (Number(isRedirect)) {
        return res.redirect(result.data.url);
      }
      return res.send({
        result: 100,
        data: result.data.url,
      });
    } else {
      return res.send({
        result: 200,
        data: result.info,
      })
    }
  },

  async ['/find']({ req, res, request, port }) {
    const { keyword } = req.query;
    if (!keyword) {
      return res.send({
        result: 500,
        errMsg: '搜啥呢？',
      })
    }
    const songRes = await request.send(`http://127.0.0.1:${port}/search?keyword=${keyword}`);
    let songInfo;
    if (songRes && songRes.data && songRes.data.list && songRes.data.list.length > 0) {
      songInfo = songRes.data.list[0];
    }

    res.send({
      result: 100,
      data: songInfo,
    })

  },
};
