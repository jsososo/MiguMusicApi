module.exports = {
  async ['/playlist']({ req, res, request }) {
    const { pageNo = 1, type = 1 } = req.query;
    let pageSize = 10;
    const typeMap = {
      2: 15127272, // 最新
      1: 15127315, // 推荐
    };
    const result = await request.send(`http://m.music.migu.cn/migu/remoting/playlist_bycolumnid_tag?playListType=2&type=1&columnId=${typeMap[type]}&tagId=&startIndex=${(pageNo - 1) * pageSize}`);

    const list: Validation.PlaylistInfo[] = result.retMsg.playlist.map(({ summary, image, createName, playCount, contentCount, createUserId, playListName, playListId }) => ({
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

    res.send({
      result: 100,
      data: {
        list,
        total: result.retMsg.countSize,
      }
    })
  }
};