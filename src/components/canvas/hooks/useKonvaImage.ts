import { useState, useCallback } from "react";
import { CanvasImageProps } from "../Canvas";
import { usePersistentImages } from "./usePersistantImages";

export function useCanvasImages() {
  const pi = usePersistentImages();

  const [images, setImages] = useState<CanvasImageProps[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedImage = images.find(img => img.id === selectedId);

  const addImage = useCallback(async (imageData: Omit<CanvasImageProps, 'id'>, file?: File, url?: string) => {
    const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newImage: CanvasImageProps = {
      id,
      ...imageData,
      style: {
        scale: 1,
        rotation: 0,
        opacity: 1,
        ...imageData.style
      }
    };
    
    setImages(prev => [...prev, newImage]);

    if (file && url) {
      const name = `image_${file.name}`;
      const blob = await (await (fetch(url))).blob();

      pi.saveImage({
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name,
        url: url,
        blob,
        data: newImage
      })
    }

    return id;
  }, []);

  const addImagesFromFiles = useCallback(async (
    files: File[], 
    layerId: string,
    startPos: { x: number; y: number } = { x: 100, y: 100 }
  ) => {
    const newImageIds: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      
      const id = await addImage({
        name: file.name,
        src: url,
        layerId,
        pos: { 
          x: startPos.x + (i * 20), 
          y: startPos.y + (i * 20) 
        }
      }, file, url);
      
      newImageIds.push(id);
    }

    return newImageIds;
  }, [addImage]);

  const updateImage = useCallback((id: string, updates: Partial<CanvasImageProps>) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, ...updates } : img
    ));
  }, []);

  const updateSelectedImage = useCallback((updates: Partial<CanvasImageProps>) => {
    if (!selectedId) return;
    updateImage(selectedId, updates);
  }, [selectedId, updateImage]);

  const deleteImage = useCallback((id: string) => {
    const img = images.find(i => i.id === id);
    if (img) {
      // Clean up the blob URL to prevent memory leaks
      URL.revokeObjectURL(img.src);
    }
    
    setImages(prev => prev.filter(img => img.id !== id));
    
    if (selectedId === id) {
      setSelectedId(null);
    }
  }, [images, selectedId]);

  const deleteSelectedImage = useCallback(() => {
    if (selectedId) {
      deleteImage(selectedId);
    }
  }, [selectedId, deleteImage]);

  const duplicateImage = useCallback((id: string) => {
    const imgToDuplicate = images.find(img => img.id === id);
    if (!imgToDuplicate) return null;

    const newId = addImage({
      name: `${imgToDuplicate.name} (copy)`,
      src: imgToDuplicate.src,
      layerId: imgToDuplicate.layerId,
      pos: {
        x: imgToDuplicate.pos.x + 20,
        y: imgToDuplicate.pos.y + 20
      },
      style: imgToDuplicate.style
    });

    return newId;
  }, [images, addImage]);

  const duplicateSelectedImage = useCallback(() => {
    if (selectedId) {
      return duplicateImage(selectedId);
    }
    return null;
  }, [selectedId, duplicateImage]);

  const moveImageToLayer = useCallback((imageId: string, targetLayerId: string) => {
    updateImage(imageId, { layerId: targetLayerId });
  }, [updateImage]);

  const getImagesByLayer = useCallback((layerId: string) => {
    return images.filter(img => img.layerId === layerId);
  }, [images]);

  const clearAllImages = useCallback(() => {
    images.forEach(img => URL.revokeObjectURL(img.src));
    setImages([]);
    setSelectedId(null);
  }, [images]);

  const clearLayerImages = useCallback((layerId: string) => {
    const layerImages = images.filter(img => img.layerId === layerId);
    layerImages.forEach(img => URL.revokeObjectURL(img.src));
    
    setImages(prev => prev.filter(img => img.layerId !== layerId));
    
    if (selectedImage && selectedImage.layerId === layerId) {
      setSelectedId(null);
    }
  }, [images, selectedImage]);

  const bringToFront = useCallback((id: string) => {
    const img = images.find(i => i.id === id);
    if (!img) return;
    
    setImages(prev => {
      const sameLayerImages = prev.filter(i => i.layerId === img.layerId);
      const otherImages = prev.filter(i => i.layerId !== img.layerId);
      const targetImage = sameLayerImages.find(i => i.id === id);
      const restImages = sameLayerImages.filter(i => i.id !== id);
      
      return [
        ...otherImages,
        ...restImages,
        ...(targetImage ? [targetImage] : [])
      ];
    });
  }, [images]);

  const bump = useCallback((id: string, direction: "up" | "down") => {
    const img = images.find(i => i.id === id);
    if (!img) return;

    setImages(prev => {
      const sameLayerImages = prev.filter(i => i.layerId === img.layerId);
      const otherImages = prev.filter(i => i.layerId !== img.layerId);

      const index = sameLayerImages.findIndex(i => i.id === id);
      if (index === -1) return prev;

      const newLayerImages = [...sameLayerImages];

      if (direction === "up" && index < newLayerImages.length - 1) {
        [newLayerImages[index], newLayerImages[index + 1]] = [newLayerImages[index + 1], newLayerImages[index]];
      } else if (direction === "down" && index > 0) {
        [newLayerImages[index], newLayerImages[index - 1]] = [newLayerImages[index - 1], newLayerImages[index]];
      }

      return [
        ...otherImages,
        ...newLayerImages
      ];
    });
  }, [images]);

  const sendToBack = useCallback((id: string) => {
    const img = images.find(i => i.id === id);
    if (!img) return;
    
    setImages(prev => {
      const sameLayerImages = prev.filter(i => i.layerId === img.layerId);
      const otherImages = prev.filter(i => i.layerId !== img.layerId);
      const targetImage = sameLayerImages.find(i => i.id === id);
      const restImages = sameLayerImages.filter(i => i.id !== id);
      
      return [
        ...(targetImage ? [targetImage] : []),
        ...restImages,
        ...otherImages
      ];
    });
  }, [images]);

  const transformSelected = useCallback((transform: {
    scale?: number;
    rotation?: number;
    opacity?: number;
    position?: { x: number; y: number };
  }) => {
    if (!selectedId) return;
    
    updateImage(selectedId, {
      ...(transform.position && { pos: transform.position }),
      style: {
        ...selectedImage?.style,
        ...(transform.scale !== undefined && { scale: transform.scale }),
        ...(transform.rotation !== undefined && { rotation: transform.rotation }),
        ...(transform.opacity !== undefined && { opacity: transform.opacity })
      }
    });
  }, [selectedId, selectedImage, updateImage]);

  const resetImageStyle = useCallback((id: string) => {
    updateImage(id, {
      style: {
        scale: 1,
        rotation: 0,
        opacity: 1
      }
    });
  }, [updateImage]);

  return {
    // State
    images,
    selectedId,
    selectedImage,
    
    // Selection
    setSelectedId,
    
    // CRUD operations
    addImage,
    addImagesFromFiles,
    updateImage,
    updateSelectedImage,
    deleteImage,
    deleteSelectedImage,
    duplicateImage,
    duplicateSelectedImage,
    
    // Layer operations
    moveImageToLayer,
    getImagesByLayer,
    clearLayerImages,
    
    // Bulk operations
    clearAllImages,
    setImages, 
    
    // Z-index operations
    bringToFront,
    bump,
    sendToBack,
    
    // Transform operations
    transformSelected,
    resetImageStyle
  };
}