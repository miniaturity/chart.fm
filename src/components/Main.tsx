import { useState } from "react";
import { CanvasImageProps } from "./canvas/Canvas";

const Main: React.FC = () => {
  const [images, setImages] = useState<CanvasImageProps[]>([]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);

    setImages((prev) => [
      ...prev,
      { id: Date.now().toString(), name: `image_${prev.length}`,src: url, pos: {x: 100, y: 100} },
    ]);
  };

  return (
    <div className="main">
      <aside>

      </aside>
      <main>

      </main>
      <aside>
        
      </aside>
    </div>
  )
}

export default Main;