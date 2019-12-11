module.exports = {
  async ['/']({ req, res, request, cheerio, getId, UrlSaver }) {
    const query = { ...req.query };
    query.type = query.type || 'song';
    if (!query.keyword) {
      return res.send({
        result: 500,
        errMsg: '搜啥呢？',
      })
    }

    const result: any = await request.send({
      url: 'http://music.migu.cn/v3/search',
      data: query,
    }, {
      dataType: 'raw',
    });

    const $ = cheerio.load(result);

    const searchResult:
      (Validation.SongInfo |
        Validation.ArtistInfo |
        Validation.AlbumInfo |
        Validation.MvInfo |
        Validation.PlaylistInfo)[]
        = [];

    switch (query.type) {
      case 'song':
        $('.songlist-item.single-item').each((i, o) => {
          const $item = cheerio(o);
          const artists: Validation.ArtistInfo[] = [];
          $item.find('.song-singer a').each((i, v) => {
            const $name = cheerio(v);
            artists.push({
              name: $name.text(),
              id: getId($name.attr('href')),
            })
          });
          const $album = $item.find('.song-album a');
          const id = $item.attr('data-id');
          const cid = $item.attr('data-cid');
          const songInfo: Validation.SongInfo = {
            name: $item.find('.song-name-text a').text(),
            id: String(id),
            cid: String(cid),
            artists,
            album: {
              name: $album.text(),
              id: String($album.data('id')),
            },
          };
          searchResult.push(songInfo);
        });
        break;
      case 'singer':
        $('.search-artist .search-artist-list').each((i, o) => {
          const $artist = cheerio(o);
          const artist: Validation.ArtistInfo = {
            name: $artist.find('.artist-name').text(),
            id: getId($artist.find('.artist-name a').attr('href')),
            picUrl: $artist.find('.artist-info img').attr('src'),
            songCount: cheerio($artist.find('.artist-cont .cont-num')[0]).text(),
            albumCount: cheerio($artist.find('.artist-cont .cont-num')[1]).text(),
            mvCount: cheerio($artist.find('.artist-cont .cont-num')[2]).text(),
          };
          searchResult.push(artist);
        });
        break;
      case 'album':
        $('#artist-album-cont li').each((i, o) => {
          const $album = cheerio(o);
          const artists: Validation.ArtistInfo[] = [];
          $album.find('.album-artist a').each((i, o) => {
            const $ar = cheerio(o);
            artists.push({
              name: $ar.text(),
              id: getId($ar.attr('href')),
            })
          });
          const albumInfo: Validation.AlbumInfo = {
            name: $album.find('.album-name').text().replace(/\n/g, ''),
            id: getId($album.find('.img-mask a').attr('href')),
            picUrl: $album.find('.music-cover img').attr('src'),
            publishTime: $album.find('.album-time').text(),
            artists,
          };
          searchResult.push(albumInfo);
        });
        break;
      case 'playlist':
        $('#artist-album-cont li').each((i, o) => {
          const $playlist=  cheerio(o);
          const playlistInfo: Validation.PlaylistInfo = {
            name: $playlist.find('.album-name').text().replace(/\n/g, ''),
            id: getId($playlist.find('.img-mask a').attr('href')),
            picUrl: $playlist.find('.music-cover img').attr('src'),
          };
          searchResult.push(playlistInfo);
        });
        break;
      case 'mv':
        $('.search-mv li').each((i, o) => {
          const $mv = cheerio(o);
          const artists: Validation.ArtistInfo[] = [];
          $mv.find('.mv-type a').each((i, o) => {
            const $ar = cheerio(o);
            artists.push({
              name: $ar.text(),
              id: getId($ar.attr('href')),
            })
          });
          const mvInfo: Validation.MvInfo = {
            name: '',
            id: getId($mv.find('.img-mask a').attr('href')),
            picUrl: $mv.find('.music-cover img').attr('src'),
            artists,
          };
          searchResult.push(mvInfo);
        });
        break;
      case 'lyric':
        $('.search-lyric-list li').each((i, o) => {
          const $lyric = cheerio(o);
          const artists: Validation.ArtistInfo[] = [];
          $lyric.find('.singer-name a').each((i, o) => {
            const $ar = cheerio(o);
            console.log($ar.attr('href'));
            artists.push({
              name: $ar.text(),
              id: getId($ar.attr('href')),
            })
          });
          const songInfo: Validation.SongInfo = {
            name: $lyric.find('.song-name-text').text().replace(/\n/g, ''),
            cid: getId($lyric.find('.song-name-text a').attr('href')),
            id: $lyric.attr('mid'),
            album: {
              name: $lyric.find('a.album-jump').first().text(),
              id: $lyric.find('a.album-jump').first().attr('data-id'),
            },
            artists,
          };
          searchResult.push(songInfo);
        });
        break;
      default: break;
    }

    const pageList = [1];
    $('.page a').each((i, p) => {
      const $page = cheerio(p).text();
      pageList.push(Number($page || 0));
    });

    res.send({
      result: 100,
      data: {
        list: searchResult,
        totalPage: Math.max(...pageList),
      },
    });
  },
};
