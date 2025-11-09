import { useEffect, useRef, useState } from "react";
import Canvas from "./canvas/Canvas";
import { useCanvas } from "./canvas/hooks/useCanvas";
import Konva from "konva";
import { LeftSideBar } from "./LeftSideBar";
import { useAlbums } from "./canvas/hooks/useAlbums";
import { keys } from "idb-keyval";

const Main: React.FC = () => {
  const c = useCanvas();
  const ua = useAlbums();

  const [isNew, setIsNew] = useState<boolean>();
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const stageRef = useRef<Konva.Stage>(null);

  useEffect(() => {
    const checkdb = async () => {
      try {
        const allKeys = await keys();
        setIsNew(allKeys.length === 0);
      } catch (err) {
        console.error(`Error fetching keys: ${err}`);
      }
    };

    checkdb();
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !c.layer.selectedLayerId) return;

    Array.from(files).forEach((file, index) => {
      const url = URL.createObjectURL(file);
      const id = `${Date.now()}_${index}`;
      
      c.image.setImages((prev) => [
        ...prev,
        { 
          id,
          name: file.name,
          src: url,
          layerId: c.layer.selectedLayerId,
          pos: { x: 100 + (index * 20), y: 100 + (index * 20) },
          style: {
            scale: 1,
            rotation: 0,
            opacity: 1
          }
        },
      ]);

      c.layer.addImageToLayer(id, c.layer.selectedLayerId);
    });

    e.target.value = '';
  };

  const exportAsImage = () => {
    const uri = stageRef.current?.toDataURL({ pixelRatio: 2 });
    if (!uri) return;

    const link = document.createElement("a");
    link.download = "collage.png";
    link.href = uri;
    link.click();
  };


  return (
    <div className="app">
      <aside className="app__lsb">
        {isNew !== undefined && <LeftSideBar 
          canvas={{ size: canvasSize, setCanvasSize: setCanvasSize }}
          userInfo={{ 
            isNew: isNew, 
            name: ua.name,
            period: ua.period,
            lastReq: ua.lastRequest,
            albums: ua.albums
          }}
          handleImage={{
            handleUpload,
            exportAsImage
          }}
        />}
      </aside>
      <main className="app__main">
        <Canvas 
          size={canvasSize}
          c={c}
          stageRef={stageRef}
        />
      </main>
      <aside className="app__rsb">
        
      </aside>
    </div>
  )
}

export default Main;