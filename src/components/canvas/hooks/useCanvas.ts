import { useLayer } from "./useLayer";
import { useCanvasImages } from "./useKonvaImage";

export function useCanvas() {
  const layer = useLayer();
  const image = useCanvasImages();

  return {
    layer,
    image
  }
}

