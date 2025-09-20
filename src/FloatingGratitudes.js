import React from 'react';
//import styled, { keyframes } from 'styled-components';

// Helper to generate random positions and animation delays
function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function FloatingGratitudes({ gratitudes }) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {gratitudes.map((text, index) => {
        // Randomize initial position and animation delay
        const style = {
          top: `${randomBetween(5, 90)}%`,
          left: `${randomBetween(5, 90)}%`,
          animationDelay: `${randomBetween(0, 20)}s`,
          animationDuration: `${randomBetween(15, 30)}s`,
          color: `rgba(255, 192, 203, 0.3)`, // soft pink with transparency
          fontSize: `${randomBetween(14, 24)}px`,
          position: 'absolute',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          fontWeight: '600',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          transformOrigin: 'center',
        };

        return (
          <span
            key={index}
            style={style}
            className="floating-word"
          >
            {text}
          </span>
        );
      })}

      <style>{`
        @keyframes floatTwist {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translate(10px, -10px) rotate(10deg);
            opacity: 0.6;
          }
          100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.3;
          }
        }
        .floating-word {
          animation-name: floatTwist;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          animation-direction: alternate;
          will-change: transform, opacity;
        }
      `}</style>
    </div>
  );
}

export default FloatingGratitudes;
