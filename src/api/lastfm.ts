type period = "overall" | "7day" | "1month" | "3month" | "6month" | "12month";
const api = "https://lastfm.nkko.workers.dev/?method=user.getTopAlbums";

export async function getTopAlbums(user: string, period: period): Promise<TopAlbumsResponse | null> {
  const userStr = `&user=${encodeURIComponent(user)}`;
  const periodStr = `&period=${period}`;
  const apiTotal = `${api}${userStr}${periodStr}`;

  try {
    const res = await fetch(apiTotal);
    if (!res.ok) throw new Error(`${res.status} - Error fetching lastfm data.`);

    const data: TopAlbumsResponse = await res.json();
    return data;
  } catch (err) {
    console.error(`${err} - Error fetching lastfm data`);
    return null;
  }
}

export interface TopAlbumsResponse {
  topalbums: {
    album: Album[];
    "@attr"?: {
      user: string;
      page: string;
      totalPages: string;
      perPage: string;
      total: string;
    };
  };
}

export interface Album {
  artist: {
    url: string;
    name: string;
    mbid: string;
  };
  image: AlbumImage[];
  mbid: string;
  url: string;
  playcount: string;
  "@attr": {
    rank: string;
  };
  name: string;
}

export interface AlbumImage {
  size: "small" | "medium" | "large" | "extralarge";
  "#text": string;
}

