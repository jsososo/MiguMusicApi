const axios = require("axios");
const xml2js = require('xml2js').xml2js;
const { changeUrlQuery } = require('./StringHelper');

class request {
  constructor({ req, res, next }) {
    this.req = req || this.req;
    this.res = res || this.res;
    this.next = next;
  }

  async send(options, opts = {}) {
    try {
      if (typeof options === 'string') {
        options = { url: options };
      }
      options.method = options.method || 'get';

      const {url, data, method} = options;
      const {dataType} = opts;

      if (method === 'get') {
        options.url = changeUrlQuery(data, url);
        delete options.data;
      }

      options.headers = options.headers || {};
      options.headers.referer = options.headers.referer || 'http://music.migu.cn/v3';
      options.xsrfCookieName = 'XSRF-TOKEN';
      options.withCredentials = true;

      const res = await axios(options);

      if (dataType === 'xml') {
        return handleXml(res.data);
      }

      if (dataType === 'raw') {
        return res.data;
      }

      if (typeof res.data === 'string') {
        res.data = res.data.replace(/callback\(|MusicJsonCallback\(|jsonCallback\(|\)$/g, '');
        return JSON.parse(res.data);
      }

      return res.data;
    } catch (err) {
      if (err.message === 'Request failed with status code 503') {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(this.send(options, opts));
          }, 300);
        });
      }
      const {res} = this;
      if (!res) {
        return {};
      }
      res.send({
        result: 400,
        errMsg: `系统异常：${err.message}`,
      })
    }
  }
}

function handleXml(data) {
  return new Promise((resolve, reject) => {
    const handleObj = (obj) => {
      Object.keys(obj).forEach((k) => {
        const v = obj[k];
        if ((typeof v).toLowerCase() === 'object' && v instanceof Array && v.length === 1) {
          obj[k] = v[0];
        }
        if ((typeof obj[k]).toLowerCase() === 'object') {
          handleObj(obj[k]);
        }
      })
    };

    xml2js(data, (err, result) => {
      handleObj(result);
      resolve(result);
    })
  })
}

module.exports = request;
