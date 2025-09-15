declare module 'interactionpane' {
  import { ReactNode, CSSProperties } from 'react';

  export interface InteractionPaneProps {
    children: ReactNode;
    scale: number;
    setScale: (scale: number) => void;
    offset: { x: number; y: number };
    setOffset: (offset: { x: number; y: number }) => void;
    minScale?: number;
    maxScale?: number;
    smoothScaling?: boolean;
    smoothPanning?: boolean;
    animationDuration?: number;
    friction?: number;
    velocity?: number;
    momentum?: boolean;
    inertia?: boolean;
    deceleration?: number;
    disabled?: boolean;
    style?: CSSProperties;
  }

  const InteractionPane: React.FC<InteractionPaneProps>;
  export default InteractionPane;
}