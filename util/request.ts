var axios = require("axios");
var xml2js = require('xml2js').xml2js;
var changeUrlQuery = require('./StringHelper').changeUrlQuery;

interface Headers {
  Cookie?: string,

  [propName: string]: any,
}

interface AxiosParam {
  url: string,
  dataType?: string,
  data?: object,
  method?: string,
  headers?: Headers,
  xsrfCookieName?: string,
  withCredentials?: boolean,

  [propName: string]: any,
}

type AxiosOpts = {
  dataType?: 'xml' | 'raw',
}

interface ResObj {
  data: string,
}

interface requestConstructor {
  req?: any,
  res?: any,
  next?: any,
}

export class request {
  req: { cookies: {}, userCookie: {}, query: { ownCookie: false } };

  res: { send: ({}) => {} };

  next: null;

  constructor({ req, res, next }: requestConstructor) {
    this.req = req || this.req;
    this.res = res || this.res;
    this.next = next;
  }

  async send(options: AxiosParam | string, opts: AxiosOpts = { }): Promise<any> {
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

      // const cookieObj: object = (Number(query.ownCookie) ? cookies : userCookie) || {};
      options.headers = options.headers || {};
      options.headers.referer = options.headers.referer || 'http://music.migu.cn/v3';
      options.xsrfCookieName = 'XSRF-TOKEN';
      options.withCredentials = true;
      // options.headers.Cookie = Object.keys(cookieObj).map((k: string): string => `${k}=${cookieObj[k]}`).join('; ');

      const res: ResObj = await axios(options);

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
        console.log('retry');
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

function handleXml(data: string): Promise<any> {
  return new Promise((resolve, reject): void => {
    const handleObj = (obj: object) => {
      Object.keys(obj).forEach((k: string): void => {
        const v: object | any[] = obj[k];
        if ((typeof v).toLowerCase() === 'object' && v instanceof Array && v.length === 1) {
          obj[k] = v[0];
        }
        if ((typeof obj[k]).toLowerCase() === 'object') {
          handleObj(obj[k]);
        }
      })
    };

    xml2js(data, (err: object, result: object): void => {
      handleObj(result);
      resolve(result);
    })
  })
}
