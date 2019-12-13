namespace Validation {
  // 路由对象，/routes 文件夹下的ts中
  export interface RouterObj {
    func: Function,
    method?: string,

    [propName: string]: any,
  }

  // 每个 /routes 文件夹里的对象
  export interface RouterMap {
    [propsName: string]: RouterObj,
  }

  // 歌曲 信息
  export interface SongInfo {
    name: string,
    artists: ArtistInfo[],
    album: AlbumInfo,
    id: string,
    cid: string,
    mvid?: number,
    picUrl?: string,
    bigPicUrl?: string,
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
  }

  // 歌单 信息
  export interface PlaylistInfo {
    name: string,
    id: string,
    picUrl: string,
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
    '320k'?: string,
    'flac'?: string,
    'pic'? : string,
    'bgPic'? : string,
  }
}
