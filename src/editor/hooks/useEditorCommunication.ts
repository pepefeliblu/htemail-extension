import { useEffect } from 'react';
import { Crepe } from '@milkdown/crepe';
import { cleanAndInlineHtml } from '../utils/htmlSanitizer';

export const useEditorCommunication = (crepeInstance: Crepe | null) => {

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'HTEMAIL_EXPORT_REQUEST') {
                handleExport(event.data.action);
            }
        };

        const handleExport = (action: 'insert' | 'copy' = 'insert') => {
            if (!crepeInstance) return;

            // WYSIWYG HTML Capture
            const editorElement = document.querySelector('.milkdown .editor');
            if (editorElement) {
                const rawHtml = editorElement.innerHTML;
                const cleanedHtml = cleanAndInlineHtml(rawHtml);

                const fragment = `
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #374151;">
                        ${cleanedHtml}
                    </div>
                `;

                // Send to parent with action context
                window.parent.postMessage({ type: 'HTEMAIL_EXPORT_SUCCESS', html: fragment, action }, '*');
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [crepeInstance]);

    // Exposed helper if needed elsewhere
    const checkContentStatus = () => {
        if (!crepeInstance) return;
        const markdown = crepeInstance.getMarkdown();
        const hasContent = markdown.trim().length > 0 && markdown.trim() !== '# Welcome to HTEMAIL\nStart typing...';
        window.parent.postMessage({ type: 'HTEMAIL_CONTENT_STATUS', hasContent }, '*');
    };

    return { checkContentStatus };
};
