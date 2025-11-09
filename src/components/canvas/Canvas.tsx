import React, { PropsWithChildren, useRef } from "react";
import { Stage, Layer } from "react-konva";
import Konva from "konva";
import { EditableImage } from "./Image";
import { Image } from "konva/lib/shapes/Image";

type repeat = "repeat" | "repeat-x" | "repeat-y" | "no-repeat";

export interface CanvasImageProps {
  id: string;
  name: string;
  src: string;
  pos: {
    x: number;
    y: number;
  };
  style?: {
    scale?: number;
    rotation?: number;
    opacity?: number;
    fill?: string;
    fillImage?: {
      img: Image;
      x: number;
      y: number;
      repeat: repeat;
    }
  };
}

interface CanvasProps {
  images: CanvasImageProps[];
  setImages: React.Dispatch<React.SetStateAction<CanvasImageProps[]>>;
  size: {
    width: number;
    height: number;
  };
}

const Canvas = (props: PropsWithChildren<CanvasProps>) => {
  const { images, setImages, size } = props;
  const stageRef = useRef<Konva.Stage>(null);

  const exportAsImage = () => {
    const uri = stageRef.current?.toDataURL({ pixelRatio: 2 });
    if (!uri) return;

    const link = document.createElement("a");
    link.download = "collage.png";
    link.href = uri;
    link.click();
  };

  return (
    <>
      <Stage width={size.width} height={size.height} ref={stageRef} >
        <Layer>
          {images.map((img) => (
            <EditableImage
              key={img.id}
              {...img}
              onChange={(newProps) =>
                setImages((prev) =>
                  prev.map((p) =>
                    p.id === img.id ? { ...p, ...newProps } : p
                  )
                )
              }
            />
          ))}
        </Layer>
      </Stage>
      <button onClick={exportAsImage} id="export">Export</button>
    </>
  );
};



export default Canvas;
