import { useState, useEffect } from 'react';
import { Stage, Layer, Image } from 'react-konva';
import TitleButton from './titleButton';
import ginghamBackground from '../../assets/gingham_bg.png';

export default function TitleScreen() {
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
    }, []);

    // preserves button layount based on screen size
    const layoutScale = Math.min(
        dimensions.width / 410,
        dimensions.height / 877,
    );
    const buttonWidth = 250 * layoutScale;
    const buttonHeight = 92 * layoutScale;
    const fontScale = layoutScale;

    return (
        // adds gingham background
        <section
            style={{
                width: dimensions.width,
                height: dimensions.height,
                backgroundImage: `url(${ginghamBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <Stage width={dimensions.width} height={dimensions.height}>
                <Layer>
                    <TitleButton
                        text="START"
                        x={130 * layoutScale}
                        y={400 * layoutScale}
                        width={buttonWidth}
                        height={buttonHeight}
                        fontSize={40 * fontScale}
                    />
                    <TitleButton
                        text="OPTIONS"
                        x={130 * layoutScale}
                        y={530 * layoutScale}
                        width={buttonWidth}
                        height={buttonHeight}
                        fontSize={40 * fontScale}
                    />
                    <TitleButton
                        text="Teacher Dashboard"
                        x={35 * layoutScale}
                        y={693 * layoutScale}
                        width={buttonWidth}
                        height={buttonHeight}
                        fontSize={32 * fontScale}
                    />
                </Layer>
            </Stage>
        </section>
    );
}