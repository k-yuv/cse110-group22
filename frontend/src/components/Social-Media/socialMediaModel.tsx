import { useEffect, useState } from 'react';
import { SCENE } from './socialMediaContent';

function viewport() {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
    };
}

export function useSocialMediaModel() {
    const [size, setSize] = useState(viewport);

    useEffect(() => {
        const onResize = () => setSize(viewport());

        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
        };
    }, []);

    // Fit the entire composition within the viewport.
    const scale = Math.min(
        size.width / SCENE.width,
        size.height / SCENE.height
    );

    // Center horizontally and shift the composition upward.
    const originX = (size.width - SCENE.width * scale) / 2;
    const originY = (size.height - SCENE.height * scale) / 2 - 55 * scale;

    return {
        ...size,
        scale,
        originX,
        originY,
    };
}
