import { Detector } from './Detector';

export class Injector {
    private detector: Detector;

    constructor() {
        this.detector = new Detector();
    }

    public init() {
        this.detector.start(this.handleComposeDetected.bind(this));

        window.addEventListener('message', (event) => {
            if (event.data.type === 'HTEMAIL_INSERT') {
                this.handleInsertRequest(event.data.html);
            }
        });

        console.log('HTEMAIL: Detector started');
    }

    private currentTarget: HTMLElement | null = null;
    private currentWrapper: HTMLElement | null = null;
    private currentTriggerBtn: HTMLElement | null = null;

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

        btn.onclick = () => {
            this.replaceEditor(target, btn);
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

    private handleInsertRequest(html: string) {
        console.log('HTEMAIL: Inserting HTML');
        if (this.currentTarget && this.currentWrapper) {
            this.currentTarget.style.display = 'block';
            this.currentTarget.innerHTML = html;
            this.currentTarget.dispatchEvent(new Event('input', { bubbles: true }));
            this.closeEditor();
        }
    }

    private closeEditor() {
        if (this.currentWrapper) {
            this.currentWrapper.remove();
            this.currentWrapper = null;
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

    private replaceEditor(target: HTMLElement, triggerBtn: HTMLElement) {
        console.log('HTEMAIL: Replacing editor');
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

        // 3. Create the Iframe
        const iframe = document.createElement('iframe');
        iframe.id = 'htemail-iframe';
        iframe.src = chrome.runtime.getURL('editor.html');
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

        // 5. Floating Insert Button (External Overlay)
        const insertBtn = document.createElement('div');
        insertBtn.innerHTML = '<span style="font-size: 18px;">🚀</span> Insert into Email';
        insertBtn.style.cssText = `
            position: absolute;
            bottom: 110px;
            right: 24px;
            z-index: 100;
            display: flex;
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

        insertBtn.onclick = () => {
            iframe.contentWindow?.postMessage({ type: 'HTEMAIL_EXPORT_REQUEST' }, '*');
        };

        wrapper.appendChild(insertBtn);
        wrapper.appendChild(closeBtn);
        wrapper.appendChild(iframe);

        // 5. Insert where the target was
        if (target.parentNode) {
            target.parentNode.insertBefore(wrapper, target.nextSibling);
        }
    }

    private renderNativeControls(container: HTMLElement, target: HTMLElement) {
        container.innerHTML = '';
        const toggleBtn = this.createButton('Email Editor', '✏️');
        // Capture 'target' correctly in closure
        toggleBtn.onclick = () => {
            this.replaceEditor(target, container);
        };
        container.appendChild(toggleBtn);
    }

    private renderEditorControls(container: HTMLElement, target: HTMLElement) {
        container.innerHTML = '';

        const insertBtn = this.createButton('Insert', '🚀');
        insertBtn.style.background = '#2563EB';
        insertBtn.style.color = 'white';
        insertBtn.onclick = () => {
            const iframe = document.getElementById('htemail-iframe') as HTMLIFrameElement;
            iframe?.contentWindow?.postMessage({ type: 'HTEMAIL_EXPORT_REQUEST' }, '*');
        };

        const closeBtn = this.createButton('Close', '✕');
        closeBtn.onclick = () => this.closeEditor(); // closeEditor handles state reset

        container.appendChild(insertBtn);
        container.appendChild(closeBtn);
    }
}
