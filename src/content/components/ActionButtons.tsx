import React, { useState } from 'react';
import { useResizeObserver } from '../hooks/useResizeObserver';

interface ActionButtonsProps {
    onInsert: () => void;
    onCopy: () => void;
    hasContent: boolean;
    container: HTMLElement;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onInsert, onCopy, hasContent, container }) => {
    const isMinimized = useResizeObserver(container);

    // Copy button state
    const [isCopyHovered, setIsCopyHovered] = useState(false);
    const [copyState, setCopyState] = useState<'idle' | 'copying' | 'success'>('idle');

    // Insert button state
    const [isInsertHovered, setIsInsertHovered] = useState(false);

    const handleCopy = async () => {
        setCopyState('copying');
        try {
            await onCopy(); // onCopy is now async or we just fire and wait a bit visually
            setCopyState('success');
            setTimeout(() => setCopyState('idle'), 2000);
        } catch (e) {
            console.error(e);
            setCopyState('idle');
        }
    };

    // Derived visibility: must not be minimized AND must have content
    const isVisible = !isMinimized && hasContent;

    // We can use 'visibility: hidden' to keep them mounted but hidden, or return null to unmount.
    // Minimization usually implies we want them gone instantly.
    // Content check is logical.
    if (!isVisible) return null;

    return (
        <>
            {/* Copy Button */}
            <div
                id="htemail-copy-btn"
                onClick={handleCopy}
                onMouseEnter={() => setIsCopyHovered(true)}
                onMouseLeave={() => setIsCopyHovered(false)}
                style={{
                    position: 'absolute',
                    bottom: '180px', // Stacked above Insert
                    right: '24px',
                    zIndex: 9001,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: copyState === 'success' ? '#dcfce7' : (isCopyHovered ? '#f9fafb' : '#ffffff'),
                    color: copyState === 'success' ? '#166534' : '#374151',
                    fontWeight: 600,
                    fontSize: '14px',
                    padding: '12px 20px',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    boxShadow: isCopyHovered
                        ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                        : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: '1px solid #e5e7eb',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    transition: 'transform 0.2s, box-shadow 0.2s, background-color 0.2s, opacity 0.2s',
                    opacity: isCopyHovered ? 1 : 0.95,
                    transform: isCopyHovered ? 'translateY(-2px)' : 'translateY(0)',
                }}
            >
                {copyState === 'idle' && <><span style={{ fontSize: '18px' }}>📋</span> Copy HTML</>}
                {copyState === 'copying' && <><span style={{ fontSize: '18px' }}>⏳</span> Generating...</>}
                {copyState === 'success' && <><span style={{ fontSize: '18px' }}>✅</span> Copied!</>}
            </div>

            {/* Insert Button */}
            <div
                onClick={onInsert}
                onMouseEnter={() => setIsInsertHovered(true)}
                onMouseLeave={() => setIsInsertHovered(false)}
                style={{
                    position: 'absolute',
                    bottom: '120px',
                    right: '24px',
                    zIndex: 9001,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: isInsertHovered ? '#1d4ed8' : '#2563eb', // blue-700 : blue-600
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '14px',
                    padding: '12px 20px',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    boxShadow: isInsertHovered
                        ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                        : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transition: 'transform 0.2s, box-shadow 0.2s, background-color 0.2s, opacity 0.2s',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    opacity: isInsertHovered ? 1 : 0.95,
                    transform: isInsertHovered ? 'translateY(-2px)' : 'translateY(0)',
                }}
            >
                <span style={{ fontSize: '18px' }}>🚀</span> Insert into Email
            </div>
        </>
    );
};
