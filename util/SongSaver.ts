import jsonFile = require('jsonfile');
import {request} from './request';
import CrypotJs = require('crypto-js');
import JsEncrypt = require('node-jsencrypt');
import SongInfo = Validation.SongInfo;

export default class SongSaver {
  constructor() {
    jsonFile.readFile('data/songUrl.json')
      .then((res) => {
        this.data = res;
      });
  }

  private data: {
    [propName: string]: SongInfo,
  };

  push(id: string, info: SongInfo): void {
    this.data[id] = info;
  }

  get(id: string): SongInfo | undefined {
    return this.data[id];
  }

  async query(cid:string, data:SongInfo | undefined = {}): Promise<SongInfo> {
    try {
      const info = this.get(cid);
      if (info) {
        this.push(cid, {...info, ...data})
        return {
          ...info,
          ...data,
        };
      }
      const req = new request({});

      const obj: Validation.SongInfo = data;

      if (!obj.flac) {
        // 一套神秘的加密环节！
        const publicKey = `------BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC8asrfSaoOb4je+DSmKdriQJKW
VJ2oDZrs3wi5W67m3LwTB9QVR+cE3XWU21Nx+YBxS0yun8wDcjgQvYt625ZCcgin
2ro/eOkNyUOTBIbuj9CvMnhUYiR61lC1f1IGbrSYYimqBVSjpifVufxtx/I3exRe
ZosTByYp4Xwpb1+WAQIDAQAB
-----END PUBLIC KEY-----`;
        const o = `{"copyrightId":"${cid}","auditionsFlag":0,"type":3}`;
        const s = new JsEncrypt;
        s.setPublicKey(publicKey);
        const a = 1e3 * Math.random();
        const u = CrypotJs.SHA256(String(a)).toString();
        const c = CrypotJs.lib.Cipher._createHelper(CrypotJs.algo.AES).encrypt(o, u).toString();
        const f = s.encrypt(u);
        const result = await req.send({
          url: 'https://music.migu.cn/v3/api/music/audioPlayer/getPlayInfo',
          data: {
            dataType: 2,
            data: c,
            secKey: f,
          },
          headers: {
            referer: 'http://music.migu.cn/v3/music/player/audio',
            channel: '0146951',
            uid: 1234,
          }
        });
        obj.flac = `http:${result.data.playUrl.replace(/\?.+$/, '')}`;
      }

      if (!obj.picUrl || !obj.lyric) {
        const sInfo = await req.send({
          url: `https://m.music.migu.cn/migu/remoting/cms_detail_tag?cpid=${cid}`,
        })
        if (sInfo.data) {
          obj.picUrl = sInfo.data.picS;
          obj.bigPicUrl = sInfo.data.picL;
          obj.cid = cid;
          obj.id = sInfo.data.songId;
          obj.name = sInfo.data.songName;
          obj.url = sInfo.data.listenUrl;
          obj.artists = (sInfo.data.singerId || []).map((id, i) => ({ id, name: (sInfo.data.singerName || [])[i] || ''}))
          obj.lyric = sInfo.data.lyricLrc;
          // obj.pic = sInfo.data.
        }
      }

      this.push(cid, obj);
      this.write();
      return obj;
    } catch (err) {
      console.log(err);
      return data;
    }
  }

  write() {
    jsonFile.writeFile('data/songUrl.json', this.data);
  }
}