import { Detector } from './Detector';

export class Injector {
    private detector: Detector;

    constructor() {
        this.detector = new Detector();
    }

    private currentTarget: HTMLElement | null = null;
    private currentWrapper: HTMLElement | null = null;
    private currentTriggerBtn: HTMLElement | null = null;
    private currentInsertBtn: HTMLElement | null = null;
    private currentCopyBtn: HTMLElement | null = null;

    public init() {
        this.detector.start(this.handleComposeDetected.bind(this));

        window.addEventListener('message', (event) => {
            if (event.data.type === 'HTEMAIL_INSERT' || event.data.type === 'HTEMAIL_EXPORT_SUCCESS') {
                this.handleExportSuccess(event.data.html, event.data.action || 'insert');
            }
            if (event.data.type === 'HTEMAIL_CONTENT_STATUS') {
                this.handleContentStatus(event.data.hasContent);
            }
        });

        console.log('HTEMAIL: Detector started');
    }

    private handleComposeDetected(editableInfo: HTMLElement) {
        // If we have already injected for this element, skip
        if (editableInfo.dataset.htemailInjected === 'true') return;
        editableInfo.dataset.htemailInjected = 'true';

        console.log('HTEMAIL: Compose window detected', editableInfo);
        this.injectButton(editableInfo);
    }

    private injectButton(target: HTMLElement) {
        // Locate a stable container that wraps the compose area.
        let container = target.closest('div[role="dialog"]');
        if (!container) {
            container = target.closest('table[role="presentation"]')?.parentElement || null;
        }

        if (!container) return;

        // Ensure container is relative so we can float inside it
        if (getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
        }

        // Avoid double injection
        if (container.querySelector('.htemail-trigger')) return;

        const btn = document.createElement('div');
        btn.className = 'htemail-trigger';
        // Elegant floating pill
        btn.innerHTML = `<span style="font-size: 16px;">📧</span> HTEMAIL`;
        btn.style.cssText = `
            position: absolute;
            bottom: 110px;
            right: 20px;
            z-index: 9000;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #ffffff;
            color: #4b5563;
            font-weight: 600;
            font-size: 13px;
            padding: 8px 12px;
            border-radius: 24px;
            cursor: pointer;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid #e5e7eb;
            font-family: system-ui, -apple-system, sans-serif;
            transition: all 0.2s ease;
            opacity: 0.9;
        `;

        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px)';
            btn.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            btn.style.color = '#2563EB';
            btn.style.borderColor = '#2563EB';
            btn.style.opacity = '1';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            btn.style.color = '#4b5563';
            btn.style.borderColor = '#e5e7eb';
            btn.style.opacity = '0.9';
        });

        // Append to container (Grammarly style overlay)
        container.appendChild(btn);

        // Generate a unique session ID for this specific compose window
        const sessionId = Date.now().toString();
        btn.dataset.sessionId = sessionId;

        btn.onclick = () => {
            this.replaceEditor(target, btn, sessionId);
        };
    }

    private createButton(text: string, icon: string) {
        const btn = document.createElement('div');
        btn.innerHTML = `<span style="font-size: 14px;">${icon}</span> ${text}`;
        btn.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: rgba(0,0,0,0.05);
            color: #444;
            font-size: 13px;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-weight: 500;
            transition: all 0.2s;
            user-select: none;
        `;
        btn.addEventListener('mouseenter', () => btn.style.background = 'rgba(0,0,0,0.1)');
        btn.addEventListener('mouseleave', () => btn.style.background = 'rgba(0,0,0,0.05)');
        return btn;
    }

    private handleContentStatus(hasContent: boolean) {
        // Toggle visibility based on content
        const display = hasContent ? 'flex' : 'none';
        if (this.currentInsertBtn) this.currentInsertBtn.style.display = display;
        if (this.currentCopyBtn) this.currentCopyBtn.style.display = display;
    }

    private handleExportSuccess(html: string, action: 'insert' | 'copy') {
        if (action === 'insert') {
            console.log('HTEMAIL: Inserting HTML');
            if (this.currentTarget && this.currentWrapper) {
                this.currentTarget.style.display = 'block';
                this.currentTarget.innerHTML = html;
                this.currentTarget.dispatchEvent(new Event('input', { bubbles: true }));
                this.closeEditor();
            }
        } else if (action === 'copy') {
            console.log('HTEMAIL: Copying HTML');
            navigator.clipboard.writeText(html).then(() => {
                if (this.currentCopyBtn) {
                    const originalContent = this.currentCopyBtn.innerHTML;
                    this.currentCopyBtn.innerHTML = '<span style="font-size: 18px;">✅</span> Copied!';
                    this.currentCopyBtn.style.backgroundColor = '#dcfce7'; // green-100
                    this.currentCopyBtn.style.color = '#166534'; // green-800

                    setTimeout(() => {
                        if (this.currentCopyBtn) {
                            this.currentCopyBtn.innerHTML = '<span style="font-size: 18px;">📋</span> Copy HTML';
                            this.currentCopyBtn.style.backgroundColor = '#ffffff';
                            this.currentCopyBtn.style.color = '#374151';
                        }
                    }, 2000);
                }
            }).catch(err => {
                console.error('Failed to copy: ', err);
                alert('Failed to copy to clipboard');
            });
        }
    }

    private closeEditor() {
        if (this.currentWrapper) {
            this.currentWrapper.remove();
            this.currentWrapper = null;
        }

        if (this.currentInsertBtn) {
            this.currentInsertBtn.remove();
            this.currentInsertBtn = null;
        }

        if (this.currentCopyBtn) {
            this.currentCopyBtn.remove();
            this.currentCopyBtn = null;
        }

        if (this.currentTarget) {
            this.currentTarget.style.display = 'block';
            this.currentTarget = null;
        }

        if (this.currentTriggerBtn) {
            this.currentTriggerBtn.style.display = 'inline-flex';
            this.currentTriggerBtn = null;
        }
    }

    // We don't need 'currentControls' anymore as we are back to floating buttons.

    private replaceEditor(target: HTMLElement, triggerBtn: HTMLElement, sessionId: string) {
        console.log('HTEMAIL: Replacing editor', sessionId);
        this.currentTarget = target;
        this.currentTriggerBtn = triggerBtn;

        // 1. Hide the native editor
        target.style.display = 'none';
        triggerBtn.style.display = 'none'; // Hide trigger when editor is open

        // 2. Create the wrapper for our editor
        const wrapper = document.createElement('div');
        this.currentWrapper = wrapper;
        wrapper.id = 'htemail-wrapper';
        wrapper.style.cssText = `
            width: 100%;
            height: 650px;
            max-height: 80vh;
            flex: 1;
            background: white;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); /* Inner shadow for depth */
            border-top: 1px solid #e5e7eb;
            position: relative;
        `;

        // 3. Create the Iframe with Unique Session ID (Reuse the one from injection)
        const iframe = document.createElement('iframe');
        iframe.id = 'htemail-iframe';
        iframe.src = chrome.runtime.getURL(`editor.html?sessionId=${sessionId}`);
        iframe.style.cssText = `
            width: 100%;
            height: 100%;
            flex: 1;
            border: none;
            display: block;
        `;

        // 4. Floating Close Button (Restored)
        const closeBtn = document.createElement('div');
        closeBtn.innerHTML = '×';
        closeBtn.title = 'Close HTEMAIL';
        closeBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            width: 32px;
            height: 32px;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(4px);
            border: 1px solid #e5e7eb;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 20px;
            color: #6b7280;
            z-index: 100;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            transition: all 0.2s;
        `;

        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = '#fee2e2'; // Light red
            closeBtn.style.color = '#ef4444';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.9)';
            closeBtn.style.color = '#6b7280';
        });

        closeBtn.onclick = () => {
            this.closeEditor();
        };

        // 5. Floating Insert Button (External Overlay - Initially Hidden)
        const insertBtn = document.createElement('div');
        insertBtn.innerHTML = '<span style="font-size: 18px;">🚀</span> Insert into Email';
        insertBtn.style.cssText = `
            position: absolute;
            bottom: 120px;
            right: 24px;
            z-index: 100;
            display: none; /* Initially hidden */
            align-items: center;
            gap: 8px;
            background-color: #2563eb;
            color: white;
            font-weight: 600;
            font-size: 14px;
            padding: 12px 20px;
            border-radius: 9999px;
            cursor: pointer;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            transition: all 0.2s ease;
            font-family: system-ui, -apple-system, sans-serif;
            opacity: 0.95;
        `;

        // 6. Floating Copy Button (Stacked ABOVE Insert - Initially Hidden)
        const copyBtn = document.createElement('div');
        copyBtn.id = 'htemail-copy-btn';
        copyBtn.innerHTML = '<span style="font-size: 18px;">📋</span> Copy HTML';
        copyBtn.style.cssText = `
            position: absolute;
            bottom: 180px; /* Stacked above Insert (120 + 40 + 20 gap) */
            right: 24px;
            z-index: 100;
            display: none; /* Initially hidden */
            align-items: center;
            gap: 8px;
            background-color: #ffffff;
            color: #374151;
            font-weight: 600;
            font-size: 14px;
            padding: 12px 20px;
            border-radius: 9999px;
            cursor: pointer;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            transition: all 0.2s ease;
            font-family: system-ui, -apple-system, sans-serif;
            border: 1px solid #e5e7eb;
            opacity: 0.95;
        `;

        // Hover effects for Insert
        insertBtn.addEventListener('mouseenter', () => {
            insertBtn.style.transform = 'translateY(-2px)';
            insertBtn.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            insertBtn.style.backgroundColor = '#1d4ed8'; // blue-700
            insertBtn.style.opacity = '1';
        });

        insertBtn.addEventListener('mouseleave', () => {
            insertBtn.style.transform = 'translateY(0)';
            insertBtn.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            insertBtn.style.backgroundColor = '#2563eb';
            insertBtn.style.opacity = '0.95';
        });

        // Hover effects for Copy
        copyBtn.addEventListener('mouseenter', () => {
            copyBtn.style.transform = 'translateY(-2px)';
            copyBtn.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            copyBtn.style.backgroundColor = '#f9fafb';
            copyBtn.style.opacity = '1';
        });

        copyBtn.addEventListener('mouseleave', () => {
            copyBtn.style.transform = 'translateY(0)';
            copyBtn.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            copyBtn.style.backgroundColor = '#ffffff';
            copyBtn.style.opacity = '0.95';
        });

        insertBtn.onclick = () => {
            iframe.contentWindow?.postMessage({ type: 'HTEMAIL_EXPORT_REQUEST', action: 'insert' }, '*');
        };

        copyBtn.onclick = () => {
            // Reset text first
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span style="font-size: 18px;">⏳</span> Generating...';
            iframe.contentWindow?.postMessage({ type: 'HTEMAIL_EXPORT_REQUEST', action: 'copy' }, '*');
        };

        // Listen for Content Status to toggle visibility
        // We attach this to the window listener in init(), but we can also manage local state or specific handlers if needed.
        // For simplicity, let's keep references here if we want to toggle them directly from the main listener,
        // OR better: store them on the class instance to access them from handleContentStatus.
        this.currentInsertBtn = insertBtn;
        this.currentCopyBtn = copyBtn;

        // Locate container again to append floating buttons
        let container = target.closest('div[role="dialog"]');
        if (!container) {
            container = target.closest('table[role="presentation"]')?.parentElement || null;
        }

        if (container) {
            // Append to container for true floating behavior (z-index 9000)
            insertBtn.style.zIndex = '9001';
            copyBtn.style.zIndex = '9001';
            container.appendChild(copyBtn);
            container.appendChild(insertBtn);
        } else {
            // Fallback if container weirdly missing (unlikely if we are here)
            wrapper.appendChild(copyBtn);
            wrapper.appendChild(insertBtn);
        }

        wrapper.appendChild(closeBtn);
        wrapper.appendChild(iframe);

        // 5. Insert where the target was
        if (target.parentNode) {
            target.parentNode.insertBefore(wrapper, target.nextSibling);
        }
    }
}
