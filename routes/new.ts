module.exports = {
  async ['/songs']({ req, res, request }) {
    const { pageNo = 1, pageSize = 10 } = req.query;
    const result = await request.send(`http://m.music.migu.cn/migu/remoting/cms_list_tag?pageSize=${pageSize}&nid=23853978&pageNo=${pageNo-1}`);

    // @ts-ignore
    const list: Validation.SongInfo[] = result.result.results.map(({ songData }) => ({
      name: songData.songName,
      id: songData.songId,
      cid: songData.copyrightId,
      artists: songData.singerName.map((name, i) => ({
        name,
        id: songData.singerId[i],
      })),
      picUrl: songData.picM,
      url: songData.listenUrl,
    }));

    res.send({
      result: 100,
      data: {
        list,
        total: result.result.totalCount,
      }
    })
  },

  async ['/albums']({ req, res, request }) {
    const { pageNo = 1, pageSize = 10 } = req.query;
    const result = await request.send(`http://m.music.migu.cn/migu/remoting/cms_list_tag?pageSize=${pageSize}&nid=23854016&pageNo=${pageNo-1}&type=2003`);

    const list: Validation.AlbumInfo[] = result.result.results.map(({ albumData }) => {
      const { albumsDes, singerId, albumId, albumName, albumsPicUrl } = albumData;
      const albumInfo = albumsDes.split('\n');
      return {
        name: albumName,
        id: albumId,
        picUrl: albumsPicUrl,
        artists: [
          {
            name: albumInfo[1].split('：')[1],
            id: singerId,
          }
        ],
        songCount: Number(albumInfo[4].split('：')[1]),
        publishTime: albumInfo[5].split('：')[1],
      }
    });
    res.send({
      result: 100,
      data: {
        list,
        total: result.result.totalCount,
      }
    })
  }
};