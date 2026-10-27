import { useState } from 'react';
import { Stage, Layer, Rect } from 'react-konva';

// Dummy component to check that Konva works: a draggable box whose color can
// be toggled with the button or by clicking the box.
export default function KonvaTest() {
  const [color, setColor] = useState('tomato');

  const toggleColor = () => {
    setColor((current) => (current === 'tomato' ? 'steelblue' : 'tomato'));
  };

  return (
    <section>
      <h1>Konva Test</h1>
      <p>Color: {color}</p>
      <button type="button" onClick={toggleColor}>
        Toggle color
      </button>

      <Stage width={300} height={200}>
        <Layer>
          <Rect
            x={20}
            y={20}
            width={100}
            height={60}
            fill={color}
            draggable
            onClick={toggleColor}
            onTap={toggleColor}
          />
        </Layer>
      </Stage>
    </section>
  );
}
