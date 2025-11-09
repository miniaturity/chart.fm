import { useCallback, useState } from "react";
import { getTopAlbums, period, TopAlbumsResponse } from "../../../api/lastfm";

export function useAlbums() {
  const [name, setName] = useState<string>();
  const [period, setPeriod] = useState<period>("overall");
  const [lastRequest, setLastRequest] = useState<number>();
  const [albums, setAlbums] = useState<TopAlbumsResponse | null>(null);

  const setUsername = useCallback((n: string) => {
    setName(encodeURIComponent(n));
  }, []);

  const canRequest = (): boolean => {
    if (!lastRequest) return true;
    const diffms = Date.now() - lastRequest;
    const diffm = diffms / (1000 * 60); // Diff in minutes
    return diffm > 1;
  };

  const getAlbums = useCallback(async () => {
    if (!name) return;
    const res = await getTopAlbums(name, period);
    setLastRequest(Date.now());
    setAlbums(res);
  }, []);

  return {
    setUsername,
    canRequest,
    getAlbums,

    name,
    setPeriod,
    period,
    lastRequest,
    albums,
    setAlbums
  }
  
}