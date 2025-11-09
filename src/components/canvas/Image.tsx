import React, { useEffect, useRef, useState } from "react";
import { Image as KonvaImage, Transformer } from "react-konva";
import { CanvasImageProps } from "./Canvas";

interface EditableImageProps extends CanvasImageProps {
  onChange: (newProps: Partial<CanvasImageProps>) => void;
  isSelected: boolean;
  onSelect: () => void;
}

export const EditableImage: React.FC<EditableImageProps> = ({
  src, pos, style, onChange, isSelected, onSelect
}) => {
  const [image, setImage] = useState<CanvasImageSource | undefined>(undefined);

  const imageRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => setImage(img);
  }, [src]);

  useEffect(() => {
    if (isSelected && trRef.current && imageRef.current) {
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <>
      <KonvaImage 
        ref={imageRef}
        image={image}
        x={pos.x}
        y={pos.y}
        scaleX={style?.scale || 1}
        scaleY={style?.scale || 1}
        rotation={style?.rotation || 0}
        opacity={style?.opacity || 1}
        fill={style?.fill}
        fillPatternImage={style?.fillImage?.img}
        fillPatternX={style?.fillImage?.x}
        fillPatternY={style?.fillImage?.y}
        fillpatternRepeat={style?.fillImage?.repeat}
        draggable
        onClick={onSelect}
        onTap={onSelect}
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
              x: node.x(),  
              y: node.y()
            },
            style: {
              rotation: node.rotation() || 0,
              scale: ((scaleX + scaleY) / 2) || 1,
              opacity: node.opacity() || 1,
              fill: node.fill(),
              fillImage: {
                img: node.fillPatternImage(),
                x: node.fillPatternImageX(),
                y: node.fillPatternImageY(),
                repeat: node.fillPatternImageRepeat()
              }
            }
          })
        }}
      />
      {isSelected && (
        <Transformer 
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
    </>
  )
}