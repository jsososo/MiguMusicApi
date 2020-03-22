module.exports = {
  async ['/']({ res, getId, cheerio, req, request }) {
    const { id, pageNo = 1, pageno = pageNo } = req.query;
    if (!id) {
      return res.send({
        result: 500,
        errMsg: 'id ？',
      })
    }

    const result = await request.send(`http://music.migu.cn/v3/music/playlist/${id}?page=${pageno}`, { dataType: 'raw' });

    const $ = cheerio.load(result);
    const pageList = [1];
    let totalPage = 1;
    $('.page a').each((i, o) => {
      const pNo = Number(cheerio(o).text());
      if (pNo === pNo) {
        pageList.push(pNo);
      }
      totalPage = Math.max(...pageList);
    });
    const baseInfo = {
      name: $('h1.title').text(),
      id,
      picUrl: $('.thumb-img').attr('src'),
      playCount: $('.playcount').text().replace(/播放量：|\n/g, ''),
      totalPage,
      creator: {
        name: $('.singer-name a').text(),
      }
    };
    const list = [];
    $('.row.J_CopySong').each((i, o) => {
      const $song = cheerio(o);
      const artists = [];
      $song.find('.J_SongSingers a').each((i, o) => {
        artists.push({
          id: getId(cheerio(o).attr('href')),
          name: cheerio(o).text(),
        })
      });
      const $album = $song.find('.song-belongs a').first();
      list.push({
        name: $song.find('.song-name-txt').text(),
        id: $song.attr('data-mid'),
        cid: $song.attr('data-cid'),
        artists,
        album: {
          id: getId($album.attr('href')),
          name: $album.text().replace(/《|》/g, ''),
        }
      });
    });

    res.send({
      result: 100,
      data: {
        ...baseInfo,
        list,
      },
    })
  },
};
