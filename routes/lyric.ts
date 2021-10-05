import RouteMap = Types.RouteMap;
import request from "@request";

const Router: RouteMap = {
  async ['/']({ query }) {
    const { cid } = query;

    if (!cid) {
      return {
        result: 500,
        errMsg: 'cid呢小老弟',
      }
    }

    const result = await request(`http://music.migu.cn/v3/api/music/audioPlayer/getLyric?copyrightId=${cid}`);

    if (result.msg === '成功') {
      return {
        result: 100,
        data: result.lyric,
      };
    }

    return {
      result: 200,
      errMsg: result.msg || '',
    };
  },
}

export default Router;
