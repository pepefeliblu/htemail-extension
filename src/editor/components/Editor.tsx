import React from 'react';
import { Crepe } from '@milkdown/crepe';
import { Milkdown, useEditor } from '@milkdown/react';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';

const Editor = () => {
    const [crepeInstance, setCrepeInstance] = React.useState<Crepe | null>(null);

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
                // Initial check
                checkContentStatus(crepe);
            });
            ctx.get(listenerCtx).updated((ctx, doc, prevDoc) => {
                const markdown = crepe.getMarkdown();
                sessionStorage.setItem(storageKey, markdown);
                checkContentStatus(crepe);
            });
        }).use(listener);

        setCrepeInstance(crepe);
        return crepe;
    });

    const checkContentStatus = (crepe: Crepe) => {
        const markdown = crepe.getMarkdown();
        const hasContent = markdown.trim().length > 0 && markdown.trim() !== '# Welcome to HTEMAIL\nStart typing...';
        window.parent.postMessage({ type: 'HTEMAIL_CONTENT_STATUS', hasContent }, '*');
    };

    // Listen for Export Request from Parent (Injector)
    React.useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'HTEMAIL_EXPORT_REQUEST') {
                handleExport(event.data.action);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [crepeInstance]);

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

    // Helper to sanitize DOM and Inline CSS
    const cleanAndInlineHtml = (html: string): string => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const body = doc.body;

        // 1. Remove ProseMirror artifacts
        body.querySelectorAll('.prosemirror-virtual-cursor, .prosemirror-gapcursor').forEach(el => el.remove());

        // 2. Unwrap Milkdown list wrappers
        body.querySelectorAll('.milkdown-list-item-block').forEach(div => {
            const li = div.querySelector('li');
            if (li) {
                div.replaceWith(li);
            } else {
                div.remove();
            }
        });

        // 3. Clean List Items & Styles
        const styles = {
            h1: 'font-size: 2em; font-weight: 700; margin-bottom: 0.5em; margin-top: 0; color: #111827;',
            h2: 'font-size: 1.5em; font-weight: 600; margin-bottom: 0.5em; margin-top: 1em; color: #1f2937;',
            h3: 'font-size: 1.25em; font-weight: 600; margin-bottom: 0.5em; margin-top: 1em; color: #374151;',
            p: 'margin-bottom: 1em; margin-top: 0;',
            ul: 'margin-top: 0; margin-bottom: 1em; padding-left: 1.5em;',
            ol: 'margin-top: 0; margin-bottom: 1em; padding-left: 1.5em;',
            li: 'margin-bottom: 0.25em;',
            a: 'color: #2563eb; text-decoration: underline;',
            img: 'max-width: 100%; height: auto; border-radius: 4px; display: block; margin: 1em 0;',
            blockquote: 'border-left: 4px solid #e5e7eb; margin-left: 0; margin-right: 0; padding-left: 1em; font-style: italic; color: #4b5563;',
            code: 'background-color: #f3f4f6; padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.9em; font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;',
            table: 'border-collapse: collapse; width: 100%; margin-bottom: 1em;',
            th: 'border: 1px solid #d1d5db; padding: 0.5em; text-align: left; background-color: #f9fafb; font-weight: 600;',
            td: 'border: 1px solid #d1d5db; padding: 0.5em; text-align: left;',
            hr: 'border: 0; border-top: 1px solid #e5e7eb; margin: 2em 0;'
        };

        // Apply Inline Styles and Cleanup
        body.querySelectorAll('*').forEach(el => {
            // Apply styles based on tag name
            const tagName = el.tagName.toLowerCase();
            if (styles[tagName as keyof typeof styles]) {
                const newStyle = styles[tagName as keyof typeof styles];
                el.setAttribute('style', newStyle + (el.getAttribute('style') || ''));
            }

            // Clean Attributes (keep only basics + style)
            const allowedAttrs = ['href', 'src', 'alt', 'width', 'height', 'title', 'target', 'style'];
            Array.from(el.attributes).forEach(attr => {
                if (!allowedAttrs.includes(attr.name)) {
                    el.removeAttribute(attr.name);
                }
            });

            // Specific Fixes
            if (tagName === 'li') {
                const labelWrapper = el.querySelector('.label-wrapper');
                if (labelWrapper) labelWrapper.remove();
                const contentDom = el.querySelector('.content-dom');
                if (contentDom) {
                    while (contentDom.firstChild) {
                        el.appendChild(contentDom.firstChild);
                    }
                    const childrenWrapper = el.querySelector('.children');
                    if (childrenWrapper) childrenWrapper.remove();
                }
            }
            // Remove empty Ps
            if (tagName === 'p' && el.textContent?.trim() === '' && el.children.length === 0) {
                el.remove();
            }
        });

        return body.innerHTML;
    };

    // Kept for reference or future "Download HTML" feature, but not used for Insert anymore
    const wrapInEmailBoilerplate = (innerHtml: string) => {
        return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  /* Base Resets */
  body { 
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
    line-height: 1.6; 
    color: #374151; 
    margin: 0; 
    padding: 0; 
    background-color: #ffffff;
  }
  
  /* Typography */
  h1 { font-size: 2em; font-weight: 700; margin-bottom: 0.5em; margin-top: 0; color: #111827; }
  h2 { font-size: 1.5em; font-weight: 600; margin-bottom: 0.5em; margin-top: 1em; color: #1f2937; }
  h3 { font-size: 1.25em; font-weight: 600; margin-bottom: 0.5em; margin-top: 1em; color: #374151; }
  p { margin-bottom: 1em; margin-top: 0; }
  
  /* Lists */
  ul, ol { margin-top: 0; margin-bottom: 1em; padding-left: 1.5em; }
  li { margin-bottom: 0.25em; }
  
  /* Links */
  a { color: #2563eb; text-decoration: underline; }
  
  /* Images */
  img { max-width: 100%; height: auto; border-radius: 4px; display: block; margin: 1em 0; }
  
  /* Blockquotes */
  blockquote { 
    border-left: 4px solid #e5e7eb; 
    margin-left: 0; 
    margin-right: 0; 
    padding-left: 1em; 
    font-style: italic; 
    color: #4b5563; 
  }
  
  /* Code */
  code { 
    background-color: #f3f4f6; 
    padding: 0.2em 0.4em; 
    border-radius: 4px; 
    font-size: 0.9em; 
    font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
  }
  
  /* Tables */
  table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
  th, td { border: 1px solid #d1d5db; padding: 0.5em; text-align: left; }
  th { background-color: #f9fafb; font-weight: 600; }
  
  /* Divider */
  hr { border: 0; border-top: 1px solid #e5e7eb; margin: 2em 0; }
</style>
</head>
<body>
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    ${innerHtml}
  </div>
</body>
</html>
        `.trim();
    };

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
