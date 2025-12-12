import { useEffect, useState } from 'react';

export function useResizeObserver(container: HTMLElement | null, threshold = 60) {
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        if (!container) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const height = entry.contentRect.height;
                // Use functional update or simple set; height check is cheap
                setIsMinimized(height < threshold);
            }
        });

        observer.observe(container);

        return () => {
            observer.disconnect();
        };
    }, [container, threshold]);

    return isMinimized;
}
