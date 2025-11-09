import React, { useEffect, useRef, useState } from "react";
import { Image as KonvaImage, Transformer } from "react-konva";
import { CanvasImageProps } from "./Canvas";

interface EditableImageProps extends CanvasImageProps {
  onChange: (newProps: Partial<CanvasImageProps>) => void;
}

export const EditableImage: React.FC<EditableImageProps> = ({
  src, pos, style, onChange
}) => {
  const [image, setImage] = useState<CanvasImageSource | undefined>(undefined);
  const [selected, setSelected] = useState<boolean>(false);

  const imageRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => setImage(img);
  }, [src]);

  useEffect(() => {
    if (selected && trRef.current && imageRef.current) {
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [selected]);

  return (
    <>
      <KonvaImage 
        ref={imageRef}
        image={image}
        x={pos.x}
        y={pos.y}
        scaleX={style?.scale || 1}
        scaleY={style?.scale || 1}
        rotation={style?.rotation || 0}
        draggable
        onClick={() => setSelected(true)}
        onDragEnd={(e: any) => {
          onChange({ pos: { x: e.target.x(), y: e.target.y() } });
        }}
        onTransformEnd={() => {
          const node = imageRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          
          onChange({
            pos: {
              x: node.x,
              y: node.y
            },
            style: {
              rotation: node.rotation() || 0,
              scale: ((scaleX + scaleY) / 2) || 1,
              opacity: node.opacity() || 1,
              fill: node.fill()
            }
          })
        }}
      />
      {selected && <Transformer ref={trRef} />}
    </>
  )
}