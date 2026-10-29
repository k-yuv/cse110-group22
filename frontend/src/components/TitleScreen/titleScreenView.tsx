import { useState, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import TitleButton from './titleButton';
import ginghamBackground from '../../assets/gingham_bg.png';
import titleImage from '../../assets/title_img.png';
import title from '../../assets/title.png'
import { URLImage } from '../URLImage/URLImage';

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
                        x={200 * layoutScale}
                        y={400 * layoutScale}
                        width={buttonWidth}
                        height={buttonHeight}
                        fontSize={40 * fontScale}
                    />
                    <TitleButton
                        text="OPTIONS"
                        x={200 * layoutScale}
                        y={530 * layoutScale}
                        width={buttonWidth}
                        height={buttonHeight}
                        fontSize={40 * fontScale}
                    />
                    <TitleButton
                        text="Teacher Dashboard"
                        x={35 * layoutScale}
                        y={700 * layoutScale}
                        width={buttonWidth}
                        height={buttonHeight}
                        fontSize={32 * fontScale}
                    />
                    {/** cat image */}
                    <URLImage
                        src={titleImage}
                        x={375 * layoutScale}
                        y={100 * layoutScale}
                        width={1200 * layoutScale}
                        height={810 * layoutScale}
                    />
                    {/** title image */}
                    <URLImage
                        src={title}
                        x={dimensions.width/4}
                        y={-50 * layoutScale}
                        width={741 * layoutScale}
                        height={515 * layoutScale}
                    />
                </Layer>
            </Stage>
        </section>
    );
}