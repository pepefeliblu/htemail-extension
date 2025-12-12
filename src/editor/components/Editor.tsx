import React, { useState } from 'react';
import { Crepe } from '@milkdown/crepe';
import { Milkdown, useEditor } from '@milkdown/react';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';
import { useEditorCommunication } from '../hooks/useEditorCommunication';

const Editor = () => {
    const [crepeInstance, setCrepeInstance] = useState<Crepe | null>(null);
    const { checkContentStatus } = useEditorCommunication(crepeInstance);

    useEditor((root) => {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('sessionId') || 'default';
        const storageKey = `htemail_draft_${sessionId}`;

        const crepe = new Crepe({
            root,
            defaultValue: sessionStorage.getItem(storageKey) || '# Welcome to HTEMAIL\nStart typing...',
        });

        // Configure Listener for Auto-Save and Content Monitoring
        crepe.editor.config((ctx) => {
            ctx.get(listenerCtx).mounted((ctx) => {
                console.log('HTEMAIL: Editor Mounted', sessionId);
                // Initial check using the instance directly since state might not be ready
                const markdown = crepe.getMarkdown();
                const hasContent = markdown.trim().length > 0 && markdown.trim() !== '# Welcome to HTEMAIL\nStart typing...';
                window.parent.postMessage({ type: 'HTEMAIL_CONTENT_STATUS', hasContent }, '*');
            });
            ctx.get(listenerCtx).updated((ctx, doc, prevDoc) => {
                const markdown = crepe.getMarkdown();
                sessionStorage.setItem(storageKey, markdown);

                const hasContent = markdown.trim().length > 0 && markdown.trim() !== '# Welcome to HTEMAIL\nStart typing...';
                window.parent.postMessage({ type: 'HTEMAIL_CONTENT_STATUS', hasContent }, '*');
            });
        }).use(listener);

        setCrepeInstance(crepe);
        return crepe;
    });

    return (
        <div className="h-full w-full bg-white flex flex-col items-center relative">
            <div className="w-full h-full overflow-y-auto overflow-x-hidden pb-32">
                <div className="max-w-3xl mx-auto min-h-full">
                    <Milkdown />
                </div>
            </div>
            {/* Control is now handled by Parent via Messaging (Injector Overlay). */}
        </div>
    );
};

export default Editor;
