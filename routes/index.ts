import RouteMap = Types.RouteMap;

const Router: RouteMap = {
  async ['/']({ res }) {
    res.render('index', { title: '咪咕 音乐 api', content: '<a href="http://jsososo.gihub.io/MiguMusicApi">查看文档</a>' });
    return true;
  }
}

export default Router;
