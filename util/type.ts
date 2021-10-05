namespace Types {
  // 路由对象，/routes 文件夹下的ts中
  export interface RouterObj {
    func: Function,
    method?: string,

    [propName: string]: any,
  }

  // 歌曲 信息
  export interface SongInfo {
    name?: string,
    artists?: ArtistInfo[],
    id?: string,
    cid?: string,
    lyric?: string,
    album?: AlbumInfo,
    mvId?: string,
    mvCid?: string,
    url?: string,
    picUrl?: string,
    bigPicUrl?: string,
    flac?: string,
    duration?: number,
  }

  // 艺人 信息
  export interface ArtistInfo {
    name: string,
    id: string,

    picUrl?: string,
    songCount?: number,
    mvCount?: number,
    albumCount?: number,
  }

  // 专辑 信息
  export interface AlbumInfo {
    name: string,
    id: string,
    artists?: ArtistInfo[],
    picUrl?: string,
    publishTime?: string,
    desc?: string,
    company?: string,
    songList?: SongInfo[],
    songCount?: string,
    duration?: number,
  }

  // 歌单 信息
  export type PlaylistInfo = {
    name: string,
    id: string,
    picUrl: string,
    songCount?: number,
    playCount?: number | string,
    creator?: {
      id?: string,
      name?: string,
    },
    totalPage?: number,
    total?: number,
    list?: SongInfo[],
  }

  // mv 信息
  export interface MvInfo {
    name: string,
    id: string,
    picUrl: string,
    artists?: ArtistInfo[],
  }

  // 歌曲尺寸
  export type SongSize = '128k' | '320k' | 'flac' | '';

  // 歌曲 url，pic 和 bigPic 表示图片和大图
  export type SongUrlMap = {
    '128k'?: string,
    '120'?: string,
    '320k'?: string,
    '320'?: string,
    'flac'?: string,
    'pic'? : string,
    'bgPic'? : string,
  }

  type Rec = Record<string, any>

  export type ResponseData = {
    result: 200 | 500,
    errMsg: string,
  } | {
    result: 100,
    data: string | SongInfo | ArtistInfo | AlbumInfo | PlaylistInfo | MvInfo | {
      list?: SongInfo[] | ArtistInfo[] | AlbumInfo[] | PlaylistInfo | MvInfo,
      pageNo?: number,
      total?: number,
      totalPath?: number,
    } | Rec
  }

  export type ReqType = {
    query?: Rec
    body?: Rec
    header?: Rec
    [key: string]: any
  }
  export type ResType = {
    send?: (res: ResponseData) => any
    redirect: (url: string) => any
    [key: string]: any
  }

  export interface RouteFunc {
    ({ query: Rec, res: ResType }): Promise<ResponseData | boolean>
  }

  export type RouteMap = Record<string, RouteFunc>
}