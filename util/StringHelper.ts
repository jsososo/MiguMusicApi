export function getQueryFromUrl(key: string, search: string): any {
  try {
    const sArr: string[] = search.split('?');
    let s: string = '';
    if (sArr.length > 1) {
      s = sArr[1];
    } else {
      return key ? undefined : {};
    }
    const querys: string[] = s.split('&');
    const result: object = {};
    querys.forEach((item: string): void => {
      const temp: string[] = item.split('=');
      result[temp[0]] = decodeURIComponent(temp[1]);
    });
    return key ? result[key] : result;
  } catch (err) {
    // 除去search为空等异常
    return key ? '' : {};
  }
}

export function changeUrlQuery(obj: object, baseUrl: string = ''): string {
  const query: object = getQueryFromUrl(null, baseUrl);
  let url: string = baseUrl.split('?')[0];

  const newQuery: object = {...query, ...obj};
  let queryArr: string[] = [];
  Object.keys(newQuery).forEach((key: string): void => {
    if (newQuery[key] !== undefined && newQuery[key] !== '') {
      queryArr.push(`${key}=${encodeURIComponent(newQuery[key])}`);
    }
  });
  return `${url}?${queryArr.join('&')}`.replace(/\?$/, '');
}

export function getId(url: string = '/'): string {
  return url.match(/\/([^\/]+)$/)[1];
}