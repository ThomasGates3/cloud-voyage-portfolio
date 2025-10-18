import React from 'react';

interface PokemonHPBarProps {
  proficiency: number;
  maxProficiency: number;
  label: string;
}

const PokemonHPBar: React.FC<PokemonHPBarProps> = ({ proficiency, maxProficiency, label }) => {
  const percentage = (proficiency / maxProficiency) * 100;

  // Determine color based on HP percentage
  const getBarColor = () => {
    if (percentage <= 30) return '#EF4444'; // Red (critical)
    if (percentage <= 50) return '#F97316'; // Orange (low)
    if (percentage <= 70) return '#FACC15'; // Yellow (moderate)
    return '#22C55E'; // Green (healthy)
  };

  const barColor = getBarColor();

  return (
    <div className="w-full animate-on-scroll">
      <style>{`
        @keyframes pokemonSlideIn {
          from {
            width: 0%;
            opacity: 0;
          }
          to {
            width: ${percentage}%;
            opacity: 1;
          }
        }

        .pokemon-bar {
          animation: pokemonSlideIn 1.5s ease-out forwards;
        }

        .pokemon-hp-container {
          border: 3px solid currentColor;
          position: relative;
          font-family: 'Courier New', monospace;
          background: #1f2937;
        }

        .pokemon-hp-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image:
            linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
          pointer-events: none;
        }
      `}</style>

      <div className="flex items-center justify-between mb-2">
        <span className="font-heading font-bold text-lg text-foreground">{label}</span>
        <span className="font-mono text-sm font-bold text-accent">
          {proficiency}/{maxProficiency} HP
        </span>
      </div>

      <div
        className="pokemon-hp-container h-8 rounded-sm overflow-hidden"
        style={{ borderColor: barColor }}
      >
        <div
          className="pokemon-bar h-full transition-all duration-300"
          style={{
            backgroundColor: barColor,
            boxShadow: `0 0 10px ${barColor}80`,
          }}
        />
      </div>

      <div className="flex justify-end mt-2">
        <span className="text-xs font-mono text-muted-foreground">
          {percentage <= 30 && '⚠️ CRITICAL'}
          {percentage > 30 && percentage <= 50 && '⚠️ LOW'}
          {percentage > 50 && percentage <= 70 && '⚡ MODERATE'}
          {percentage > 70 && '✓ MASTERED'}
        </span>
      </div>
    </div>
  );
};

export default PokemonHPBar;
