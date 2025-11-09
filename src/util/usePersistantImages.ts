import { useState, useEffect, useCallback } from "react";
import { get, set, keys, del } from "idb-keyval";
import { CanvasImageProps } from "../components/canvas/Canvas";

export interface StoredImage {
  id: string;
  name: string;
  url: string; 
  blob: Blob;
  data: CanvasImageProps;
}


export function usePersistentImages() {
  const [images, setImages] = useState<StoredImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      const allKeys = await keys();
      const loaded: StoredImage[] = [];

      for (const key of allKeys) {
        if (typeof key === "string" && key.startsWith("image_")) {
          const data = await get<StoredImage>(key);
          if (data) loaded.push(data);
        }
      }

      setImages(loaded);
      setImagesLoading(false);
    };

    loadImages();
  }, []);

  const saveImage = useCallback(async (img: StoredImage) => {
    await set(`image_${img.id}`, img);
    setImages((prev) => {
      const exists = prev.find((p) => p.id === img.id);
      if (exists) {
        return prev.map((p) => (p.id === img.id ? img : p));
      } else {
        return [...prev, img];
      }
    });
  }, [])

  const deleteImage = useCallback(async (id: string) => {
    await del(`image_${id}`);
    setImages((prev) => prev.filter((img) => img.id !== id)); 
  }, []);

  const clearAll = useCallback(async () => {
    const allKeys = await keys();
    await Promise.all(
      allKeys
        .filter((k) => typeof k === "string" && k.startsWith(`image_`))
        .map(k => del(k))
    );
    setImages([]);
  }, [])

  return { images, imagesLoading, saveImage, deleteImage, clearAll };
}