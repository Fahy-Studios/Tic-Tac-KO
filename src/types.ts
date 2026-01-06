export interface Upgrade {
  id: string;
  name: string;
  description: string;
  effect: () => void;
}

export type WinningLine = [number, number][];
export type WinningLines = WinningLine[];

export interface ParticleEvent {
  id: number;
  startX: number;
  startY: number;
  color: string;
}

export interface FloatingTextItem {
  id: number;
  text: string;
  x: number;
  y: number;
  color?: string;
  onCompleteCallback?: () => void;
}
