import SongInfo = Validation.SongInfo;

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

export async function getBatchSong(cids: string[] = [], request): Promise<SongInfo[]> {
  const songs = await request.send(`https://music.migu.cn/v3/api/music/audioPlayer/songs?type=1&copyrightId=${cids.join(',')}`).catch(() => ({ items: []}))

  return (songs.items || []).map(({ copyrightId, length = '00:00:00', songName, singers = [], albums = [], mvList = [], songId }) => ({
    id: songId,
    cid: copyrightId,
    name: songName,
    artists: singers.map(({ artistId, artistName }) => ({ id: artistId, name: artistName })),
    album: albums[0] ? { id: albums[0].albumId, name: albums[0].albumId } : undefined,
    duration: (length || '00:00:00').split(':').reduce((t, v, i) => t + Number(v) * Math.pow(60, 2 - i), 0),
    mvId: mvList[0] ? mvList[0].mvId : undefined,
    mvCid: mvList[0] ? mvList[0].copyrightId : undefined,
  }))
}