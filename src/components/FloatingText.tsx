import React, { useEffect, useState } from 'react';

interface FloatingTextProps {
  id: number;
  text: string;
  x: number;
  y: number;
  color?: string;
  onComplete: (id: number) => void;
}

const FloatingText: React.FC<FloatingTextProps> = ({ id, text, x, y, color = '#ff3333', onComplete }) => {
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    left: x,
    top: y,
    color: color,
    fontSize: '48px',
    fontWeight: '900',
    pointerEvents: 'none',
    zIndex: 10001,
    whiteSpace: 'nowrap', // Prevent wrapping
    textAlign: 'center',
    // Thick outline using multiple text-shadows for high visibility
    textShadow: `
      3px 3px 0 #000,
      -3px -3px 0 #000,  
      3px -3px 0 #000,
      -3px 3px 0 #000,
      0px 3px 0 #000,
      0px -3px 0 #000,
      3px 0px 0 #000,
      -3px 0px 0 #000
    `,
    opacity: 1,
    transform: 'translate(-50%, -50%) scale(0.5)',
    // Faster animation: 1.5s total. Top moves for 1.5s, Opacity waits 0.8s then fades in 0.7s
    transition: 'top 1.3s ease-out, transform 1.3s ease-out, opacity 0.3s ease-in 0.5s',
    fontFamily: '"Comic Neue", "Comic Sans MS", cursive, sans-serif'
  });

  useEffect(() => {
    // Trigger animation in next frame
    requestAnimationFrame(() => {
      setStyle(prev => ({
        ...prev,
        top: y - 120, // Float up slightly less distance
        opacity: 0,
        transform: 'translate(-50%, -50%) scale(1.2)'
      }));
    });

    const timer = setTimeout(() => {
      onComplete(id);
    }, 1500); // 1.5s total duration

    return () => clearTimeout(timer);
  }, [id, y, onComplete]);

  return (
    <div style={style}>
      {text}
    </div>
  );
};

export default FloatingText;
