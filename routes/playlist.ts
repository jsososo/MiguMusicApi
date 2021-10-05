import RouteMap = Types.RouteMap;
import request from "@request";
import { getBatchSong } from "@util";
import cheerio from 'cheerio';

const Router: RouteMap = {
  async ['/']({ query }) {
    const { id } = query;
    const playListRes = await request(`http://m.music.migu.cn/migu/remoting/query_playlist_by_id_tag?onLine=1&queryChannel=0&createUserId=migu&contentCountMin=5&playListId=${id}`);

    const listInfo = playListRes?.rsp?.playList[0];

    if (!listInfo) {
      return {
        result: 200,
        errMsg: playListRes.info || '服务异常',
      }
    }

    const { playListName: name, createName, createUserId, playCount, contentCount, image: picUrl, summary: desc, createTime, updateTime, tagLists, playListType } = listInfo;
    const baseInfo = {
      name,
      id,
      picUrl,
      playCount,
      trackCount: contentCount,
      desc,
      creator: {
        id: createUserId,
        name: createName || '',
      },
      createTime,
      updateTime,
      tagLists,
      list: [],
    };

    const cids = [];

    let pageNo = 1;
    while ((pageNo-1) * 20 < contentCount) {
      const listPage = await request(`https://music.migu.cn/v3/music/playlist/${id}?page=${pageNo}`, {
        dataType: 'raw',
      })

      const $ = cheerio.load(listPage);

      $('.row.J_CopySong').each((i, v) => cids.push(cheerio(v).attr('data-cid')));

      pageNo += 1;
    }

    // const { contentList = []} = await request.send(`http://m.music.migu.cn/migu/remoting/playlistcontents_query_tag?playListType=${playListType}&playListId=${id}&contentCount=${contentCount}`)


    baseInfo.list = await getBatchSong(cids);

    return {
      result: 100,
      data: baseInfo,
    }
    // for (let i in res.contentList) {
    //   const { songId } = contentList[i];
    //   const s = await require('./song')['/']({ req: { query: { id: songId }}}, request).catch(() => null);
    //   console.log(s);
    //   s && baseInfo.list.push(s);
    // }

    // Promise.all(contentList.map(({ songId }) => (
    //
    // ))).then((resArr) => {
    //   baseInfo.list = resArr.map(({ data }) => data).filter((o) => Boolean(o));
    //   return res.send({
    //     result: 100,
    //     data: baseInfo,
    //   })
    // })
  },
}

export default Router;
