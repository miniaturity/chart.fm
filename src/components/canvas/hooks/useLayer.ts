import { useCallback, useState } from "react";
import { CanvasImageProps } from "../Canvas";

export interface LayerGroup {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  imageIds: string[];
}

export function useLayer() {
  const [selectedLayerId, setSelectedLayerId] = useState<string>('layer_1');
  const [layers, setLayers] = useState<LayerGroup[]>([
    {
      id: 'layer_1',
      name: 'Main',
      visible: true,
      locked: false,
      opacity: 1,
      imageIds: []
    }
  ]);

  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  const addLayer = useCallback(() => {
    const newLayerId = `layer_${Date.now()}`;
    const newLayer: LayerGroup = {
      id: newLayerId,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      locked: false,
      opacity: 1,
      imageIds: []
    };
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(newLayerId); 
    return newLayerId;
  }, [layers.length]);

  const toggleVisibility = useCallback((layerId: string) => {
    setLayers(prev => prev.map(l => 
      l.id === layerId ? { ...l, visible: !l.visible } : l
    ));
  }, []);

  const toggleLock = useCallback((layerId: string) => {
    setLayers(prev => prev.map(l => 
      l.id === layerId ? { ...l, locked: !l.locked } : l
    ));
  }, []);

  const setLayerOpacity = useCallback((x: number, id: string) => {
    setLayers(prev => prev.map(l => 
      l.id == id ? { ...l, opacity: Math.max(0, Math.min(1, x)) } : l
    ))
  }, [])

  const addImageToLayer = useCallback((imageId: string, layerId?: string) => {
    const targetLayerId = layerId || selectedLayerId;
    setLayers(prev => prev.map(l => 
      l.id === targetLayerId 
        ? { ...l, imageIds: [...l.imageIds, imageId] }
        : l
    ));
  }, [selectedLayerId]);

  const deleteLayer = useCallback((layerId: string) => {
    if (layers.length <= 1) {
      console.warn('Cannot delete the last layer');
      return false;
    }
    
    setLayers(prev => prev.filter(l => l.id !== layerId));
    
    if (selectedLayerId === layerId) {
      const remainingLayers = layers.filter(l => l.id !== layerId);
      setSelectedLayerId(remainingLayers[0]?.id || '');
    }
    
    return true;
  }, [layers.length, selectedLayerId]);

  const removeImageFromLayer = useCallback((imageId: string) => {
    setLayers(prev => prev.map(l => ({
      ...l,
      imageIds: l.imageIds.filter(id => id !== imageId)
    })));
  }, []);

  const moveImageToLayer = useCallback((imageId: string, targetLayerId: string) => {
    setLayers(prev => prev.map(l => {
      if (l.imageIds.includes(imageId)) {
        return { ...l, imageIds: l.imageIds.filter(id => id !== imageId) };
      }
      if (l.id === targetLayerId) {
        return { ...l, imageIds: [...l.imageIds, imageId] };
      }
      return l;
    }));
  }, []);

  const getLayerImages = useCallback((layerId: string, allImages: CanvasImageProps[]) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return [];
    return allImages.filter(img => layer.imageIds.includes(img.id));
  }, [layers]);

  const isLayerLocked = useCallback((layerId: string) => {
    return layers.find(l => l.id === layerId)?.locked || false;
  }, [layers]);

  const isLayerVisible = useCallback((layerId: string) => {
    return layers.find(l => l.id === layerId)?.visible ?? true;
  }, [layers]);

  const clearLayer = useCallback((layerId: string) => {
    setLayers(prev => prev.map(l =>
      l.id === layerId ? { ...l, imageIds: [] } : l
    ));
  }, []);

  const moveLayer = useCallback((layerId: string, direction: 'up' | 'down') => {
    setLayers(prev => {
      const index = prev.findIndex(l => l.id === layerId);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newLayers = [...prev];
      [newLayers[index], newLayers[newIndex]] = [newLayers[newIndex], newLayers[index]];
      return newLayers;
    });
  }, []);

  const renameLayer = useCallback((layerId: string, name: string) => {
    setLayers(prev => 
      prev.map(l =>
        l.id === layerId ? { ...l, name: name } : l
      )
    )
  }, []);
 

   return {
    // State
    layers,
    selectedLayerId,
    selectedLayer,
    
    // Selection
    setSelectedLayerId,
    
    // Layer CRUD
    addLayer,
    deleteLayer,
    renameLayer,
    clearLayer,
    moveLayer,
    
    // Layer Properties
    toggleVisibility,
    toggleLock,
    setLayerOpacity,
    isLayerLocked,
    isLayerVisible,
    
    // Image Management
    addImageToLayer,
    removeImageFromLayer,
    moveImageToLayer,
    getLayerImages,
  };
}