module.exports = {
  async ['/']({ res, getId, cheerio, req, request }) {
    const { id, pageno: page } = req.query;
    if (!id) {
      return res.send({
        result: 500,
        errMsg: 'id ？',
      })
    }

    const result = await request.send(`http://music.migu.cn/v3/music/playlist/${id}?page=${page}`, { dataType: 'raw' });

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
        // id: getId($('.singer-name a').attr('href')),
        name: $('.singer-name a').text(),
      }
    };
    const list: Validation.SongInfo[] = [];
    $('.row.J_CopySong').each((i, o) => {
      const $song = cheerio(o);
      const artists: Validation.ArtistInfo[] = [];
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
    const data: Validation.PlaylistInfo = {
      ...baseInfo,
      list,
    };

    res.send({
      result: 100,
      data,
    })
  },
};
