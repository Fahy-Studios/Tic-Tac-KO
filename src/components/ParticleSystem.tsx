import React, { useEffect, useState, useRef } from 'react';
import { ParticleEvent } from '../types';

interface Particle {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  color: string;
  randomX: number;
  randomY: number;
}

interface ParticleSystemProps {
  events: ParticleEvent[];
  targetRef: React.RefObject<HTMLDivElement>;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ events, targetRef }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const processedEventIds = useRef(new Set<number>());
  const timeouts = useRef<Set<ReturnType<typeof setTimeout> | number>>(new Set());

  useEffect(() => {
    if (events.length === 0 || !targetRef.current) return;

    const newEvents = events.filter(e => !processedEventIds.current.has(e.id));
    
    if (newEvents.length === 0) return;

    newEvents.forEach(e => processedEventIds.current.add(e.id));

    const targetRect = targetRef.current.getBoundingClientRect();
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;

    const newParticles = newEvents.map(event => {
       return Array.from({ length: 8 }).map((_, i) => ({
        id: event.id * 100 + i,
        startX: event.startX,
        startY: event.startY,
        targetX: targetX,
        targetY: targetY,
        color: event.color,
        randomX: (Math.random() - 0.5) * 40,
        randomY: (Math.random() - 0.5) * 40
      }));
    }).flat();

    setParticles(prev => [...prev, ...newParticles]);

    const timer = setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
        timeouts.current.delete(timer);
    }, 1500);
    
    timeouts.current.add(timer);

  }, [events, targetRef]);

  useEffect(() => {
    return () => {
      timeouts.current.forEach(t => clearTimeout(t));
      timeouts.current.clear();
    };
  }, []);

  useEffect(() => {
    if (events.length === 0) {
      processedEventIds.current.clear();
    }
  }, [events]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}>
      {particles.map((p, i) => (
        <div
          key={p.id}
          className="exp-crystal"
          style={{
            '--start-x': `${p.startX}px`,
            '--start-y': `${p.startY}px`,
            '--target-x': `${p.targetX}px`,
            '--target-y': `${p.targetY}px`,
            '--random-x': `${p.randomX}px`,
            '--random-y': `${p.randomY}px`,
            '--delay': `${(i % 8) * 0.02}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default ParticleSystem;