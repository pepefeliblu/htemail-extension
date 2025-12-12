import React, { useState } from 'react';

interface ComposeOverlayProps {
    sessionId: string;
    onClose: () => void;
    onIframeMount: (iframe: HTMLIFrameElement | null) => void;
}

export const ComposeOverlay: React.FC<ComposeOverlayProps> = ({ sessionId, onClose, onIframeMount }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            id="htemail-wrapper"
            style={{
                width: '100%',
                height: '650px',
                maxHeight: '80vh',
                flex: 1,
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                borderTop: '1px solid #e5e7eb',
                position: 'relative'
            }}
        >
            <div
                onClick={onClose}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                title="Close HTEMAIL"
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '32px',
                    height: '32px',
                    background: isHovered ? '#fee2e2' : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '20px',
                    color: isHovered ? '#ef4444' : '#6b7280',
                    zIndex: 100,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s'
                }}
            >
                ×
            </div>
            <iframe
                id="htemail-iframe"
                ref={onIframeMount}
                src={chrome.runtime.getURL(`editor.html?sessionId=${sessionId}`)}
                style={{
                    width: '100%',
                    height: '100%',
                    flex: 1,
                    border: 'none',
                    display: 'block'
                }}
            />
        </div>
    );
};
