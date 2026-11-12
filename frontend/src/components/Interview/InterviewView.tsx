import { Layer, Rect, Stage, Group, Text } from 'react-konva';
import { useEffect, useState } from 'react';
import { COLORS } from '../../theme';
import { URLImage } from '../URLImage/URLImage';
import cat from '../../assets/whistleblower_cat.png'
import SettingsButton from '../SettingsButton/SettingsButton';

const DESK_RATIO = 600 / 832;

function getWindowSize() {
  return { width: window.innerWidth, height: window.innerHeight };
}

export default function Interview() {
  const [size, setSize] = useState(getWindowSize);
  const [dimensions] = useState({
       width: window.innerWidth,
       height: window.innerHeight,
   });

  useEffect(() => {
    const handleResize = () => setSize(getWindowSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const deskY = size.height * DESK_RATIO;
  const layoutScale = Math.min(
       dimensions.width / 410,
       dimensions.height / 877,
   );

  return (
    <main style={{ position: 'fixed', inset: 0, background: '#FFF7DD' }}>
       <SettingsButton />
       <Stage width={size.width} height={size.height}>
            <Layer>
            <Rect y={deskY} width={size.width} height={size.height - deskY} fill={COLORS.desk} />
            <URLImage
                src={cat}
                x={200 * layoutScale}
                y={100 * layoutScale}
                width={600 * layoutScale / 1.25}
                height={810 * layoutScale / 1.25}
            />
            <Group x={600} y={100}>
                        <Rect
                            width={500}
                            height={100}
                            fill="#b0a295"
                            stroke="#4C2100"
                            strokeWidth={8}
                            cornerRadius={100 * (40 / 92)}
                        />
                        <Text
                            text={"Choose a question to ask."}
                            align="center"
                            verticalAlign="middle"
                            fontSize={32}
                            fontFamily="Coiny"
                            fill="#4C2100"
                            width={500}
                            height={100}
                        />
            </Group>
            </Layer>
       </Stage>
    </main>
   );
}