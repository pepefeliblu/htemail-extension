export const styles = {
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

export const cleanAndInlineHtml = (html: string): string => {
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

    // 3. Apply Inline Styles and Cleanup
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
