module.exports = {
  async ['/']({ res, req, request, port }) {
    const { id } = req.query;
    const playListRes = await request.send(`http://m.music.migu.cn/migu/remoting/playlist_query_tag?onLine=1&queryChannel=0&createUserId=migu&contentCountMin=5&playListId=${id}`);

    if (!playListRes.playlist || !playListRes.playlist[0]) {
      return res.send({
        result: 200,
        errMsg: playListRes.info,
      })
    }
    const listInfo = playListRes.playlist[0];
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

    const { contentList = [] } = await request.send(`http://m.music.migu.cn/migu/remoting/playlistcontents_query_tag?playListType=${playListType}&playListId=${id}&contentCount=${contentCount}`)

    Promise.all(contentList.map(({ songId }) => (
      request.send(`http://127.0.0.1:${port}/song?id=${songId}`)
    ))).then((resArr) => {
      baseInfo.list = resArr.map(({ data }) => data).filter((o) => Boolean(o));
      return res.send({
        result: 100,
        data: baseInfo,
      })
    })
  },
};
