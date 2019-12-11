import jsonFile = require('jsonfile');
import { request } from './request';
import CrypotJs = require('crypto-js');
import JsEncrypt = require('node-jsencrypt');

export default class SongUrlSaver {
  constructor() {
    jsonFile.readFile('data/songUrl.json')
      .then((res) => {
        this.data = res;
      });
  }

  private data: {
    [propName: string]: Validation.SongUrlMap,
  };

  push(id: string, info: Validation.SongUrlMap): void {
    this.data[id] = info;
  }

  get(id: string): Validation.SongUrlMap {
    return this.data[id];
  }

  check(id: string, type: Validation.SongSize, url: string): boolean {
    return Boolean(this.data[id] && this.data[id][type] === url);
  }

  async query(id: string, cid: string): Promise<object> {
    try {
      const req = new request({});
      // 一套神秘的加密环节！
      const publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC8asrfSaoOb4je+DSmKdriQJKW
VJ2oDZrs3wi5W67m3LwTB9QVR+cE3XWU21Nx+YBxS0yun8wDcjgQvYt625ZCcgin
2ro/eOkNyUOTBIbuj9CvMnhUYiR61lC1f1IGbrSYYimqBVSjpifVufxtx/I3exRe
ZosTByYp4Xwpb1+WAQIDAQAB
-----END PUBLIC KEY-----`;
      const o = `{"copyrightId":"${cid}","auditionsFlag":0}`;
      const s = new JsEncrypt;
      s.setPublicKey(publicKey);
      const a = 1e3 * Math.random();
      const u = CrypotJs.SHA256(String(a)).toString();
      const c = CrypotJs.lib.Cipher._createHelper(CrypotJs.algo.AES).encrypt(o, u).toString();
      const f = s.encrypt(u);
      const result = await req.send({
        url: 'http://music.migu.cn/v3/api/music/audioPlayer/getPlayInfo',
        data: {
          dataType: 2,
          data: c,
          secKey: f,
        },
        headers: {
          referer: 'http://music.migu.cn/v3/music/player/audio'
        }
      });

      if (!result || result.msg !== '成功') {
        return {};
      }

      const obj: Validation.SongUrlMap = {};
      const sizeMap = {
        bqPlayInfo: '128k',
        hqPlayInfo: '320k',
        sqPlayInfo: 'flac',
      };
      const picRes = await req.send({
        url: `http://music.migu.cn/v3/api/music/audioPlayer/getSongPic?songId=${id}`,
        headers: {
          referer: 'http://music.migu.cn/v3/music/player/audio'
        }
      });
      obj.pic = picRes.mediumPic;
      obj.bgPic = picRes.largePic;
      Object.keys(result.data).forEach((k) => {
        if (sizeMap[k] && result.data[k]) {
          obj[sizeMap[k]] = result.data[k].playUrl;
        }
      });

      this.push(id, obj);
      return obj;
    } catch (err) {
      return {};
    }
  }

  write() {
    jsonFile.writeFile('data/songUrl.json', this.data);
  }
}