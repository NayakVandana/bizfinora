import { useEffect, useState } from 'react';

const DEFAULT_MAX = 520;
const HORIZONTAL_PADDING = 48;

/** Scale PDF preview to fit narrow viewports (mobile). */
export function usePreviewWidth(maxWidth = DEFAULT_MAX): number {
    const [width, setWidth] = useState(maxWidth);

    useEffect(() => {
        const update = () => {
            setWidth(
                Math.min(
                    maxWidth,
                    Math.max(280, window.innerWidth - HORIZONTAL_PADDING),
                ),
            );
        };

        update();
        window.addEventListener('resize', update);

        return () => window.removeEventListener('resize', update);
    }, [maxWidth]);

    return width;
}
