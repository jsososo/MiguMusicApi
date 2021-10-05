import RouteMap = Types.RouteMap;
import SongInfo = Types.SongInfo;
import AlbumInfo = Types.AlbumInfo;
import request from "@request";

const Router: RouteMap = {
  async ['/songs']({ query }) {
    const { pageNo = 1, pageSize = 10 } = query;
    const result = await request(`http://m.music.migu.cn/migu/remoting/cms_list_tag?pageSize=${pageSize}&nid=23853978&pageNo=${pageNo-1}`);

    const list: SongInfo[] = result.result.results.map(({ songData }) => ({
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

    return {
      result: 100,
      data: {
        list,
        total: result.result.totalCount,
      }
    }
  },

  async ['/albums']({ query }) {
    const { pageNo = 1, pageSize = 10 } = query;
    const result = await request(`http://m.music.migu.cn/migu/remoting/cms_list_tag?pageSize=${pageSize}&nid=23854016&pageNo=${pageNo-1}&type=2003`);

    const list: AlbumInfo[] = result.result.results.map(({ albumData }) => {
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
    return {
      result: 100,
      data: {
        list,
        total: result.result.totalCount,
      }
    }
  }
}

export default Router;
