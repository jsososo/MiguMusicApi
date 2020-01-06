import SongInfo = Validation.SongInfo;

module.exports = {
  async ['/']({ req, res, request }) {
    const query = { ...req.query };
    query.type = query.type || 'song';
    if (!query.keyword) {
      return res.send({
        result: 500,
        errMsg: '搜啥呢？',
      })
    }

    const { keyword, pageNo = 1, pageSize = 20 } = query;
    const typeMap = {
      song: 2,
      singer: 1,
      album: 4,
      playlist: 6,
      mv: 5,
      lyric: 7,
    };


    const result = await request.send({
      url: 'http://m.music.migu.cn/migu/remoting/scr_search_tag',
      data: {
        keyword,
        pgc: pageNo,
        rows: pageSize,
        type: typeMap[query.type],
      },
    });

    let data: Validation.SongInfo[] | Validation.ArtistInfo[] | Validation.AlbumInfo[] | Validation.MvInfo | Validation.PlaylistInfo[];
    switch (query.type) {
      case 'lyric':
      case 'song':
        data = result.musics.map(({ songName, singerId, singerName, albumName, albumId, mp3, cover, id, copyrightId, mvId, mcCopyrightId }) => {
          const singerIds = singerId.replace(/\s/g, '').split(',');
          const singerNames = singerName.replace(/\s/g, '').split(',');
          const artists: Validation.ArtistInfo[] = singerIds.map((id, i) => ({ id, name: singerNames[i] }));
          return {
            name: songName,
            id,
            cid: copyrightId,
            mvId,
            mvCid: mcCopyrightId,
            url: mp3,
            album: {
              picUrl: cover,
              name: albumName,
              id: albumId,
            },
            artists,
          }
        });
        break;
      case 'singer':
        data = result.artists.map(({ title, id, songNum, albumNum, artistPicM }) => ({
          name: title,
          id,
          picUrl: artistPicM,
          songCount: songNum,
          albumCount: albumNum,
        }));
        break;
      case 'album':
        data = result.albums.map(({ albumPicM, singer, songNum, id, publishDate, title }) => ({
          name: title,
          id,
          artists: singer,
          songCount: songNum,
          publishTime: publishDate,
          picUrl: albumPicM,
        }));
        break;
      case 'playlist':
        data = result.songLists.map(({ name, img, id, playNum, musicNum, userName, userId, intro }) => ({
          name,
          id,
          picUrl: img,
          playCount: playNum,
          songCount: musicNum,
          intro,
          creator: {
            name: userName,
            id: userId,
          }
        }));
        break;
      case 'mv':
        data = result.mv.map(({ songName, id, mvCopyrightId, mvId, copyrightId, albumName, albumId, singerName, singerId }) => {
          const singerIds = singerId.replace(/\s/g, '').split(',');
          const singerNames = singerName.replace(/\s/g, '').split(',');
          const artists: Validation.ArtistInfo[] = singerIds.map((id, i) => ({ id, name: singerNames[i] }));
          return {
            name: songName,
            id,
            mvId,
            cid: copyrightId,
            mvCid: mvCopyrightId,
            album: {
              name: albumName,
              id: albumId,
            },
            artists,
          }
        });
        break;
    }

    res.send({
      result: 100,
      data: {
        list: data,
        total: result.pgt,
      },
    });
  },
};