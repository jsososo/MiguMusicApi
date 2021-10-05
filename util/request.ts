// @ts-ignore
import axios from 'axios';
import * as xml2js from 'xml2js';
import { changeUrlQuery } from "./util";

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

const request = async (options: AxiosParam | string, opts: AxiosOpts = {}): Promise<any> => {
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
    options.headers.referer = options.headers.referer || 'http://m.music.migu.cn/v3';
    options.xsrfCookieName = 'XSRF-TOKEN';
    options.withCredentials = true;
    // options.headers.Cookie = Object.keys(cookieObj).map((k: string): string => `${k}=${cookieObj[k]}`).join('; ');

    //@ts-ignore
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
          resolve(request(options, opts));
        }, 300);
      });
    }
    return {};
  }
}

export default request;

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

    xml2js.parseString(data, (err: object, result: object): void => {
      handleObj(result);
      resolve(result);
    })
  })
}
