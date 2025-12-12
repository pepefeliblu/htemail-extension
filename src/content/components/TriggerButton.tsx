import React, { useState } from 'react';
import { useResizeObserver } from '../hooks/useResizeObserver';

interface TriggerButtonProps {
    onClick: () => void;
    container: HTMLElement;
}

export const TriggerButton: React.FC<TriggerButtonProps> = ({ onClick, container }) => {
    const isMinimized = useResizeObserver(container);
    const [isHovered, setIsHovered] = useState(false);

    if (isMinimized) return null;

    return (
        <div
            className="htemail-trigger"
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                position: 'absolute',
                bottom: '110px',
                right: '20px',
                zIndex: 9000,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                color: isHovered ? '#2563EB' : '#4b5563',
                fontWeight: 600,
                fontSize: '13px',
                padding: '8px 12px',
                borderRadius: '24px',
                cursor: 'pointer',
                boxShadow: isHovered
                    ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: isHovered ? '1px solid #2563EB' : '1px solid #e5e7eb',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                transition: 'transform 0.2s, box-shadow 0.2s, background-color 0.2s, color 0.2s, border-color 0.2s, opacity 0.2s',
                opacity: isHovered ? 1 : 0.9,
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
            }}
        >
            <span style={{ fontSize: '16px' }}>📧</span> HTEMAIL
        </div>
    );
};
