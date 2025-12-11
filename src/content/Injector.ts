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
        let toolbar = target.closest('table')?.querySelector('tr[id*="btC"]');
        const container = target.parentElement?.parentElement;

        if (!container) return;

        const btn = document.createElement('div');
        btn.innerText = 'HTEMAIL Editor';
        btn.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: #2563EB;
            color: white;
            font-weight: bold;
            font-size: 13px;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            z-index: 9999;
            margin: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            font-family: sans-serif;
            position: absolute;
            bottom: 60px; /* Moved up a bit */
            right: 20px;
            transition: all 0.2s;
        `;

        btn.addEventListener('mouseenter', () => btn.style.transform = 'translateY(-1px)');
        btn.addEventListener('mouseleave', () => btn.style.transform = 'translateY(0)');

        // Append to parent relative
        target.parentElement!.style.position = 'relative';
        target.parentElement!.appendChild(btn);

        btn.onclick = () => {
            this.replaceEditor(target, btn);
        };
    }

    private handleInsertRequest(html: string) {
        console.log('HTEMAIL: Inserting HTML');
        if (this.currentTarget && this.currentWrapper) {
            // Restore visibility so we can manipulate focus/selection if needed
            this.currentTarget.style.display = 'block';

            // Insert HTML
            // For Gmail contenteditable, usually focusing and pasting or setting innerHTML works.
            this.currentTarget.innerHTML = html;

            // Dispatch input event to ensure Gmail acknowledges the change
            this.currentTarget.dispatchEvent(new Event('input', { bubbles: true }));

            // Cleanup
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
            if (this.currentTarget.parentElement) {
                this.currentTarget.parentElement.style.height = '';
                this.currentTarget.parentElement.style.display = '';
                this.currentTarget.parentElement.style.flexDirection = '';
            }
            this.currentTarget = null;
        }

        if (this.currentTriggerBtn) {
            this.currentTriggerBtn.style.display = 'inline-flex';
            this.currentTriggerBtn = null;
        }
    }

    private replaceEditor(target: HTMLElement, triggerBtn: HTMLElement) {
        console.log('HTEMAIL: Replacing editor');
        this.currentTarget = target;
        this.currentTriggerBtn = triggerBtn;

        // 1. Hide the native editor
        target.style.display = 'none';
        triggerBtn.style.display = 'none'; // Hide our own button

        // Fix parent height issue in Gmail
        if (target.parentElement) {
            target.parentElement.style.height = '100%';
            target.parentElement.style.display = 'flex';
            target.parentElement.style.flexDirection = 'column';
        }

        // 2. Create the wrapper for our editor
        const wrapper = document.createElement('div');
        this.currentWrapper = wrapper;
        wrapper.id = 'htemail-wrapper';
        wrapper.style.cssText = `
            width: 100%;
            height: 100%;
            flex: 1;
            background: white;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            min-height: 600px; /* Increased height for better visibility */
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid #e5e7eb;
            border-radius: 8px;
        `;

        // 3. Create the Iframe
        const iframe = document.createElement('iframe');
        iframe.src = chrome.runtime.getURL('editor.html');
        iframe.style.cssText = `
            width: 100%;
            height: 100%;
            flex: 1;
            border: none;
            display: block;
        `;

        // 4. Close Button (to revert)
        const closeBtn = document.createElement('button');
        closeBtn.innerText = 'Close HTEMAIL';
        closeBtn.style.cssText = `
            padding: 8px;
            background: #f3f4f6;
            border: none;
            border-bottom: 1px solid #e5e7eb;
            cursor: pointer;
            text-align: right;
            font-size: 12px;
            color: #6b7280;
        `;
        closeBtn.onclick = () => {
            this.closeEditor();
        };

        wrapper.appendChild(closeBtn);
        wrapper.appendChild(iframe);

        // 5. Insert after the hidden target
        target.parentNode?.insertBefore(wrapper, target.nextSibling);
    }
}
