import RouteMap = Types.RouteMap;
import request from "@request";

const Router: RouteMap = {
  async ['/playlist']({ query }) {
    const { pageNo = 1, type = 1 } = query;
    let pageSize = 10;
    const typeMap = {
      2: 15127272, // 最新
      1: 15127315, // 推荐
    };
    const result = await request(`http://m.music.migu.cn/migu/remoting/playlist_bycolumnid_tag?playListType=2&type=1&columnId=${typeMap[type]}&tagId=&startIndex=${(pageNo - 1) * pageSize}`);

    const list: Types.PlaylistInfo[] = result.retMsg.playlist.map(({ summary, image, createName, playCount, contentCount, createUserId, playListName, playListId }) => ({
      name: playListName,
      id: playListId,
      picUrl: image,
      playCount: playCount,
      songCount: Number(contentCount),
      creator: {
        name: createName,
        id: createUserId,
      },
      intro: summary,
    }));

    return {
      result: 100,
      data: {
        list,
        total: result.retMsg?.countSize,
      }
    }
  }
}

export default Router;
