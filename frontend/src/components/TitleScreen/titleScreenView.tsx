import { useState, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import { useNavigate } from 'react-router';
import TitleButton from './titleButton';
import ginghamBackground from '../../assets/gingham_bg.png';
import titleImage from '../../assets/title_img.png';
import title from '../../assets/title.png'
import { URLImage } from '../URLImage/URLImage';
import { ROUTES } from '../../routes';
import Settings from "../Settings/Settings.tsx";

export default function TitleScreen() {
    const navigate = useNavigate();
    const [fontReady, setFontReady] = useState(
        () => typeof document === 'undefined' || !document.fonts,
    );
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const [settingsOpen, setSettingsOpen] = useState(false);

    // waits for font to load before rendering page, fixing button alignment issue on startup.
    useEffect(() => {
        const fonts = document.fonts;
        if (!fonts) return;

        let cancelled = false;
        const fontReadyPromise = fonts
            ? Promise.all([
                fonts.load('32px Coiny'),
                fonts.load('40px Coiny'),
            ]).then(() => fonts.ready)
            : Promise.resolve();

        void fontReadyPromise.then(() => {
            if (!cancelled) setFontReady(true);
        });

        return () => {
            cancelled = true;
        };
    }, []);

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

    // @ts-expect-error: ignoring for CI
    return (
        // adds gingham background
        <section
            style={{
                position: 'fixed',
                inset: 0,
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                backgroundImage: `url(${ginghamBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {fontReady && <Stage width={dimensions.width} height={dimensions.height}>
                <Layer>
                    <TitleButton
                        text="START"
                        x={200 * layoutScale}
                        y={400 * layoutScale}
                        width={buttonWidth}
                        height={buttonHeight}
                        fontSize={40 * fontScale}
                        onClick={() => navigate(ROUTES.desk)}
                    />
                    <TitleButton
                        text="OPTIONS"
                        x={200 * layoutScale}
                        y={530 * layoutScale}
                        width={buttonWidth}
                        height={buttonHeight}
                        fontSize={40 * fontScale}
                        onClick={() => setSettingsOpen(true)}
                    />
                    <TitleButton
                        text={'Teacher\nDashboard'}
                        x={35 * layoutScale}
                        y={700 * layoutScale}
                        width={buttonWidth}
                        height={buttonHeight}
                        fontSize={32 * fontScale}
                        onClick={() => navigate(ROUTES.teacherDashboard)}
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
            </Stage>}
            <Settings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} title="Settings" children={undefined} />
        </section>
    );
}