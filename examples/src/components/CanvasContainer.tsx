import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
`;

interface CanvasContainerProps {
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({ onCanvasReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      onCanvasReady(canvasRef.current);
    }
  }, [onCanvasReady]);

  return (
    <Container>
      <Canvas ref={canvasRef} />
    </Container>
  );
}; 