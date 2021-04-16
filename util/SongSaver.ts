import jsonFile = require('jsonfile');
import {request} from './request';
import CrypotJs = require('crypto-js');
import JsEncrypt = require('node-jsencrypt');
import SongInfo = Validation.SongInfo;
import SongUrlMap = Validation.SongUrlMap;

export default class SongSaver {
  constructor() {
    jsonFile.readFile('data/songUrl.json')
      .then((res) => {
        this.data = res;
      }).catch(() => {
        this.data = {}
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

//       if (!obj.flac) {
//         // 一套神秘的加密环节！
//         const publicKey = `------BEGIN PUBLIC KEY-----
// MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC8asrfSaoOb4je+DSmKdriQJKW
// VJ2oDZrs3wi5W67m3LwTB9QVR+cE3XWU21Nx+YBxS0yun8wDcjgQvYt625ZCcgin
// 2ro/eOkNyUOTBIbuj9CvMnhUYiR61lC1f1IGbrSYYimqBVSjpifVufxtx/I3exRe
// ZosTByYp4Xwpb1+WAQIDAQAB
// -----END PUBLIC KEY-----`;
//         const o = `{"copyrightId":"${cid}","auditionsFlag":0,"type":3}`;
//         const s = new JsEncrypt;
//         s.setPublicKey(publicKey);
//         const a = 1e3 * Math.random();
//         const u = CrypotJs.SHA256(String(a)).toString();
//         const c = CrypotJs.lib.Cipher._createHelper(CrypotJs.algo.AES).encrypt(o, u).toString();
//         const f = s.encrypt(u);
//         const result = await req.send({
//           url: 'https://music.migu.cn/v3/api/music/audioPlayer/getPlayInfo',
//           data: {
//             dataType: 2,
//             data: c,
//             secKey: f,
//           },
//           headers: {
//             referer: 'http://music.migu.cn/v3/music/player/audio',
//             channel: '0146951',
//             uid: 1234,
//           }
//         });
//         console.log(result.data)
//         obj.flac = `http:${result.data.playUrl.replace(/\?.+$/, '')}`;
//       }

      if (!obj.picUrl || !obj.url || !obj.picUrl) {
        const sInfo = await req.send({
          url: `https://c.musicapp.migu.cn/MIGUM2.0/v1.0/content/resourceinfo.do?copyrightId=${cid}&resourceType=2`,
        })
        if (sInfo.resource && sInfo.resource[0]) {
          const data = sInfo.resource[0];
          obj.picUrl = (data.albumImgs || [{ img: '' }])[0].img;
          obj.bigPicUrl = obj.picUrl;
          obj.cid = cid;
          obj.id = data.songId;
          obj.name = data.songName;
          const typeMap = {
            PQ: '128',
            HQ: '320',
            SQ: 'flac',
          };
          (data.newRateFormats || data.rateFormats || []).forEach(({ formatType, androidUrl, url = androidUrl }) => {
            if (typeMap[formatType]) {
              obj[typeMap[formatType]] = url.replace(/ftp:\/\/[^/]+/, 'https://freetyst.nf.migu.cn');
            }
          })
          obj.artists = data.artists;

          data.lrcUrl && (obj.lyric = await req.send({ url: data.lrcUrl }, { dataType: 'raw' }))
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
    jsonFile.writeFile('data/songUrl.json', this.data).catch(() => {});
  }
}