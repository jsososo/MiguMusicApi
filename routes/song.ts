import RouterMap = Types.RouteMap;
import SongInfo = Types.SongInfo;
import searchRouter from './search';
import { getBatchSong, songSaver } from "@util";

const Router: RouterMap = {
  async ['/']({ query }) {
    const { cid } = query;
    if (!cid) {
      return {
        result: 500,
        errMsg: 'cid ?',
      }
    }

    let song: SongInfo = (await getBatchSong([cid]))[0];
    song = await songSaver.query(cid, song);
    return {
      result: 100,
      data: song,
    };
  },

  async ['/url']({ query, res }) {
    const { cid, flac = '0' ,isRedirect = '0' } = query;
    if (!cid) {
      return {
        result: 500,
        errMsg: 'cid ?',
      }
    }
    const info: SongInfo = await songSaver.query(cid);

    let url = info[128] || '';
    if (flac/1) {
      url = info.flac || url;
    }
    if (isRedirect/1) {
      res.redirect(url)
      return true;
    }
    return {
      result: 100,
      data: url,
    }
  },

  async ['/find']({ query, res }) {
    const { keyword, duration = 0, noMatch = '' } = query;
    if (!keyword) {
      return {
        result: 500,
        errMsg: '搜啥呢？',
      }
    }
    const noMatchArr = noMatch.split(',');
    const songRes = await searchRouter['/']({ query: { keyword }, res }).catch(() => ({}));
    // @ts-ignore
    const songList: SongInfo[] = songRes?.data?.list || [];
    let s: SongInfo;
    if (songList.length) {
      if (Number(duration)) {
        const cids = songList
          .splice(0, noMatch.length + 5)
          .filter(({ cid }) => !noMatchArr.includes(cid))
          .map(({ cid }) => cid);
        const list = await getBatchSong(cids);
        s = list.find(({ duration: d }) => d <= (Number(duration) + 3) && d >= (duration - 3));
      } else {
        s = songList[0];
      }
    }
    s && s.cid && (s = await songSaver.query(s.cid, s));

    return {
      result: 100,
      data: s,
    }
  },
}

export default Router;