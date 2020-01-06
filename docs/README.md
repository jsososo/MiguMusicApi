# 咪咕MusicApi

这是一个基于 Express + Axios 的 Nodejs 项目，一切仅供学习参考，该支持的还是要支持的，不然杰伦喝不起奶茶了。

`master` 分支为 ts 项目，`js` 分支为 js 项目，里面本质都是一样都，第一次写 ts 项目，肯定有不少不规范或者不太好的地方，也欢迎大家指出

对于所有处理过的返回数据，都会包含 `result`，`100` 表示成功，`500` 表示传参错误，`400` 为 node 捕获的未知异常

灵感来源：[Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)

灵感来源：[jsososo/QQMusicApi](https://github.com/jsososo/QQMusicApi) 没错，来自我自己～

## Start

```shell
$ git clone git@github.com:jsososo/MiguMusicApi.git

$ npm install

$ npm start
```

默认已经全局安装 `typescript` 和 `ts-node` 没有的童鞋 全局安装一下哈，js 分支就不用了

项目默认端口为 3400

**在线接口测试网址：[http://api.migu.jsososo.com](http://api.migu.jsososo.com)**

## 用前须知

!> 该项目仅做接口转发，网页爬虫，部分接口通过修改 `Referer` 实现，目前还没有账户信息相关接口，保护好各自账号信息安全哟

!> 本项目仅供学习使用，请尊重版权，请勿利用此项目从事商业行为!
本项目仅供学习使用，请尊重版权，请勿利用此项目从事商业行为!
本项目仅供学习使用，请尊重版权，请勿利用此项目从事商业行为

!> 测试接口仅供各位测试使用，不要大量的调用，部署端已经增设了高频ip的黑白名单限制，有需要的童鞋可以自行 clone 运行项目

## 已知问题

其实这个项目并不适合用来作使用人数较多的后台，项目中很多接口是利用网页爬虫实现，当上一个爬虫接口还未返回时，
下一个爬虫接口会返回 503 错误（咪咕返回），所以在 request 中加入了重试，如果是503错误会在 300ms 之后重试，
这样可能导致接口返回缓慢，目前还没想好有什么好的解决方法。


## Feature

- 搜索接口 （歌曲、歌单、专辑、mv、歌手、歌词）

- 匹配歌曲

- 获取音乐、图片 链接

- 获取歌词接口

## 更新记录

20-01-06：🍉 推荐、新歌，部分接口优化

19-12-20：🍈 歌单接口、歌曲信息接口

19-12-18：🍋 搜索接口优化

19-12-13：🍎 歌手、专辑相关接口

19-12-11：🍍 咪咕音乐！

## 接口文档

### 搜索

接口：`/search`

参数：

`keyword`: 搜索关键词 必填

`type`: 默认 `song`，支持：`song`, `playlist`, `mv`, `singer`, `album`, `lyric`

`pageno`: 默认 1

这个接口是急于爬虫实现的，不支持返回条数控制，也不知道总条数，但是会在返回参数里告诉你总页码，实测返回的条数也不固定。

返回数据格式示例：
```javascript
{
  result: 100,
  data: {
    list: [...],
    totalPage: 5,
  }
}
```

栗子：[/search?keyword=周杰伦](http://api.migu.jsososo.com/search?keyword=周杰伦)

### 匹配歌曲

接口： `/song/find`

参数：

`keyword`: 搜索关键词 必填

这个接口一般用来输入 歌手 + 歌名 + 专辑 来进行匹配歌曲。通过调用搜索接口并取第一首歌信息来实现，同时这个接口会返回专辑图片和播放链接的信息，
上面的搜索接口不会。

栗子：[/song/find?keyword=周杰伦+晴天](http://api.migu.jsososo.com/song/find?keyword=周杰伦+晴天)

### 歌曲信息

接口：`/song`

参数：

`id`: 歌曲 id 必填

`cid`: 歌曲 cid 必填

获取歌曲的基本信息，会返回歌曲的链接，如果只需要链接建议走下面的接口，更快一点

栗子：[/song?id=3790007&cid=60054701923](http://api.migu.jsososo.com/song?id=3790007&cid=60054701923)

### 获取音乐、图片链接

接口：`/song/url`

参数：

`id`: 歌曲 id 必填

`cid`: 歌曲 cid 必填

`needPic`: 是否需要返回图片链接，默认 0 ，0：不需要，1：需要

`type`: 更新链接时需要

`url`: 更新链接时需要

这个接口每次获取完链接后会把这些url信息用json的方式存储到服务器，这样可以避免频繁的调用接口，如果服务器上存储的链接已经失效，需要更新时，
可以传入 `type` 和 `url`，如 `128k` 和 对应的播放链接，这时就会去重新获取链接更新服务器信息。

栗子：[/song/url?id=3790007&cid=60054701923](http://api.migu.jsososo.com/song/url?id=3790007&cid=60054701923)

### 获取歌词

接口：`/song/lyric`

参数：

`cid`: 歌曲 cid 必填

栗子：[/lyric?cid=60054701923](http://api.migu.jsososo.com/lyric?cid=60054701923)

### 专辑

#### 专辑信息

接口： `/album`

参数：

`id`: 专辑 id 必填

栗子：[/album?id=1003767159](http://api.migu.jsososo.com/album?id=1003767159)

#### 专辑歌曲

接口：`/album/songs`

参数：

`id`: 专辑 id 必填

栗子：[/album/songs?id=1003767159](http://api.migu.jsososo.com/album/songs?id=1003767159)

### 歌手

#### 歌手介绍

接口：`/singer/desc`

参数：

`id`: 歌手 id 必填

栗子：[/singer/desc?id=112](http://api.migu.jsososo.com/singer/desc?id=112)

#### 歌手歌曲

接口：`/singer/songs`

参数：

`id`: 歌曲 id 必填

`pageno`: 分页，默认 1

这个接口中一页为20首歌曲，同样，返回 `totalPage` 参数不返回总数

栗子：[/singer/songs?id=112](http://api.migu.jsososo.com/singer/songs?id=112)

#### 歌手专辑

接口：`/singer/albums`

参数：

`id`: 歌曲 id 必填

`pageno`: 分页，默认 1

栗子：[/singer/albums?id=112](http://api.migu.jsososo.com/singer/albums?id=112)


### 歌单信息

接口：`/playlist`

参数：

`id`: 歌单 id 必填

`pageno`: 分页 默认 1

一页显示20条内容，根据 `pageTotal` 来判断总页数

栗子：[/playlist?id=115481041](http://api.migu.jsososo.com/playlist?id=115481041)

### 推荐

#### 推荐歌单

接口：`/recommend/playlist`

参数：

`pageNo`: 默认 1

`type`: 1: 推荐, 2: 最新，默认推荐

一页显示10条。

栗子：[/recommend/playlist](http://api.migu.jsososo.com/recommend/playlist)

#### 新歌

接口：`/new/songs`

参数：

`pageNo`: 默认 1

`pageSize`: 默认 10

栗子：[/new/songs](http://api.migu.jsososo.com/new/songs)

#### 新专辑

接口：`/new/albums`

参数：

`pageNo`: 默认 1

`pageSize`: 默认 10

栗子：[/new/albums](http://api.migu.jsososo.com/new/albums)
