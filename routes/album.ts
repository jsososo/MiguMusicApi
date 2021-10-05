import RouteMap = Types.RouteMap;
import SongInfo = Types.SongInfo;
import ArtistInfo = Types.ArtistInfo;
import AlbumInfo = Types.AlbumInfo;
import request from '@request';
import cheerio from 'cheerio';
import { getId } from '@util';

const Router: RouteMap = {
  async ['/']({ query }) {
    const { id } = query;
    if (!id) {
      return {
        result: 500,
        errMsg: 'id ?'
      }
    }
    const result = await request(`http://music.migu.cn/v3/music/album/${id}`, {
      dataType: 'raw',
    });

    const $ = cheerio.load(result);

    const desc = $('.content .intro').text();
    const name = $('.content .title').text();
    const publishTime = $('.content .pub-date').text().replace(/[^\d|-]/g, '');
    const picUrl = $('.mad-album-info .thumb-img').attr('src');
    const songList: SongInfo[] = [];
    const artists: ArtistInfo[] = [];
    const company = $('.pub-company').text().replace(/^发行公司：/, '');
    $('.singer-name a').each((i, o) => {
      artists.push({
        id: getId(cheerio(o).attr('href')),
        name: cheerio(o).text()
      });
    });
    $('.songlist-body .J_CopySong').each((i, o) => {
      const ar: ArtistInfo[] = [];
      const $song = cheerio(o);
      $song.find('.song-singers a').each((i, o) => {
        ar.push({
          id: getId(cheerio(o).attr('href')),
          name: cheerio(o).text()
        })
      });
      songList.push({
        name: $song.find('.song-name-txt').text(),
        id: $song.attr('data-mid'),
        cid: $song.attr('data-cid'),
        artists: ar,
        album: {
          name,
          id,
        }
      })
    });

    const data: AlbumInfo = {
      name,
      id,
      artists,
      company,
      publishTime,
      picUrl,
      desc,
      songList,
    };

    return {
      result: 100,
      data,
    };
  },

  async ['/songs']({ query }) {
    const { id } = query;
    if (!id) {
      return {
        result: 500,
        errMsg: 'id ？'
      }
    }
    const result = await request(`http://m.music.migu.cn/migu/remoting/cms_album_song_list_tag?albumId=${id}&pageSize=100`);
    const data: SongInfo[] = result.result.results.map(({ picM, listenUrl, singerId, singerName, songId, songName, mvCopyrightId, copyrightId }) => ({
      picUrl: picM,
      url: listenUrl,
      id: songId,
      cid: copyrightId,
      mvCid: mvCopyrightId,
      name: songName,
      artists: singerId.map((id, i) => ({
        id,
        name: singerName[i],
      }))
    }));

    return {
      result: 100,
      data,
    }
  },
}

export default Router;
