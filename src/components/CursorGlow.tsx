import React, { useEffect, useState } from 'react';

const CursorGlow: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      className={`pointer-events-none fixed w-48 h-48 rounded-full transition-opacity duration-300 ${
        isVisible ? 'opacity-20' : 'opacity-0'
      }`}
      style={{
        left: `${position.x - 96}px`,
        top: `${position.y - 96}px`,
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.3) 40%, transparent 70%)',
        filter: 'blur(40px)',
        zIndex: 1,
      }}
    />
  );
};

export default CursorGlow;
