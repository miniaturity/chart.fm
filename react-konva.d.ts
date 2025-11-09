import 'react-konva';

declare module 'react-konva' {
  interface StageProps {
    children?: React.ReactNode;
  }
}

// Fix for: https://github.com/konvajs/react-konva/issues/342