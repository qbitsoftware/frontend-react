import React, { useState, useEffect } from 'react';

const SfumatoBackground = ({ children, className = '' }) => {
  const [blobs, setBlobs] = useState([]);

  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  useEffect(() => {
    const newBlobs = [];
    // Create 6 blobs with vibrant colors
    for (let i = 0; i < 6; i++) {
      // Use more vibrant, noticeable colors
      const r1 = random(100, 255);
      const g1 = random(100, 255);
      const b1 = random(46, 87); // Emphasize green
      
      const r2 = random(50, 200);
      const g2 = random(50, 200);
      const b2 = random(180, 215); // Emphasize blue
      
      newBlobs.push({
        id: i,
        size: random(300, 800),
        top: random(0, 200),
        left: random(0, 200),
        color1: `rgba(${r1}, ${g1}, ${b1}, 0.1)`,
        color2: `rgba(${r2}, ${g2}, ${b2}, 0.1)`
      });
    }
    setBlobs(newBlobs);
  }, []);

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-xl ${className}`}>
      {/* Sfumato background */}
      <div className="absolute inset-0 w-full h-full bg-gray-50">
        {blobs.map(blob => (
          <div
            key={blob.id}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${blob.size}px`,
              height: `${blob.size}px`,
              top: `${blob.top}px`,
              left: `${blob.left}px`,
              background: `radial-gradient(circle, ${blob.color1} 0%, ${blob.color2} 70%, transparent 100%)`,
              filter: 'blur(25px)',
              opacity: 0.8,
              animation: `blobFloat ${random(15, 25)}s ease-in-out infinite alternate`,
              animationDelay: `${random(-5, 0)}s`,
            }}
          />
        ))}
      </div>
      
      {/* Content layer */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
      
      {/* CSS for animation */}
      <style jsx>{`
        @keyframes blobFloat {
          0% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(30px, -20px) scale(1.1);
          }
          100% {
            transform: translate(-20px, 30px) scale(0.9);
          }
        }
      `}</style>
    </div>
  );
};

export default SfumatoBackground;