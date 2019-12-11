# 咪咕MusicApi

这是一个基于 Express + Axios 的 Nodejs 项目，一切仅供学习参考，该支持的还是要支持的，不然杰伦喝不起奶茶了。

`master` 分支为 ts 项目，`js` 分支为 js 项目，里面本质都是一样都，第一次写 ts 项目，肯定有不少不规范或者不太好的地方，也欢迎大家指出

对于所有处理过的返回数据，都会包含 `result`，`100` 表示成功，`500` 表示穿参错误，`400` 为 node 捕获的未知异常

灵感来源：[Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)

灵感来源：[jsososo/QQMusicApi](https://github.com/jsososo/QQMusicApi) 没错，来自我自己～

## Start

```shell
$ git clone git@github.com:jsososo/QQMusicApi.git

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

## Feature

- 搜索接口 （歌曲、歌单、专辑、mv、歌手、歌词）

- 匹配歌曲

- 获取音乐、图片 链接

- 获取歌词接口

## 更新记录

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
