import React from 'react';

/**
 * Filtros SVG para simulación y compensación de Daltonismo
 * (Protanopía, Deuteranopía, Tritanopía)
 */
export const ColorBlindnessFilters: React.FC = () => {
  return (
    <svg
      style={{ display: 'none' }}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Protanopía (Dificultad rojo) */}
        <filter id="a11y-filter-protanopia-svg">
          <feColorMatrix
            type="matrix"
            values="0.567, 0.433, 0,     0, 0
                    0.558, 0.442, 0,     0, 0
                    0,     0.242, 0.758, 0, 0
                    0,     0,     0,     1, 0"
          />
        </filter>

        {/* Deuteranopía (Dificultad verde) */}
        <filter id="a11y-filter-deuteranopia-svg">
          <feColorMatrix
            type="matrix"
            values="0.625, 0.375, 0,   0, 0
                    0.7,   0.3,   0,   0, 0
                    0,     0.3,   0.7, 0, 0
                    0,     0,     0,   1, 0"
          />
        </filter>

        {/* Tritanopía (Dificultad azul/amarillo) */}
        <filter id="a11y-filter-tritanopia-svg">
          <feColorMatrix
            type="matrix"
            values="0.95, 0.05,  0,     0, 0
                    0,    0.433, 0.567, 0, 0
                    0,    0.475, 0.525, 0, 0
                    0,    0,     0,     1, 0"
          />
        </filter>
      </defs>
    </svg>
  );
};
