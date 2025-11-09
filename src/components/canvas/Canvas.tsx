import React, { PropsWithChildren, useEffect, } from "react";
import { Stage, Layer } from "react-konva";
import Konva from "konva";
import { EditableImage } from "./Image";
import { Image } from "konva/lib/shapes/Image";
import { useCanvas } from "./hooks/useCanvas";

type repeat = "repeat" | "repeat-x" | "repeat-y" | "no-repeat";

export interface CanvasImageProps {
  id: string;
  name: string;
  layerId: string;
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
      img: HTMLImageElement;
      x: number;
      y: number;
      repeat: repeat;
    }
  };
}

export interface CanvasProps {
  size: {
    width: number;
    height: number;
  };
  c: ReturnType<typeof useCanvas>
  stageRef:  React.RefObject<Konva.Stage | null>
}

const Canvas = (props: PropsWithChildren<CanvasProps>) => {
  const { size, c, stageRef } = props;

  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage()) {
      c.image.setSelectedId(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!c.image.selectedId) return;

    if (e.key === 'Delete' || e.key === 'Backspace') {
      c.image.setImages((prev) => prev.filter(img => img.id !== c.image.selectedId));
      c.image.setSelectedId(null);
      e.preventDefault();
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      const imgToDuplicate = c.image.images.find(img => img.id === c.image.selectedId);
      if (imgToDuplicate) {
        const newId = `${Date.now()}_dup`;
        c.image.setImages((prev) => [
          ...prev,
          {
            ...imgToDuplicate,
            id: newId,
            pos: {
              x: imgToDuplicate.pos.x + 20,
              y: imgToDuplicate.pos.y + 20
            }
          }
        ]);
      }
      e.preventDefault();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [c.image.selectedId, c.image.images]);

  return (
    <>
      <Stage width={size.width} height={size.height} ref={stageRef} >
        <Layer>
          {c.image.images.map((img) => (
            <EditableImage
              key={img.id}
              {...img}
              isSelected={img.id === c.image.selectedId}
              onSelect={() => c.image.setSelectedId(img.id)}
              onChange={(newProps) =>
                c.image.setImages((prev) =>
                  prev.map((p) =>
                    p.id === img.id ? { ...p, ...newProps } : p
                  )
                )
              }
            />
          ))}
        </Layer>
      </Stage>
    </>
  );
};



export default Canvas;
