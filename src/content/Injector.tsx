import { Detector } from './Detector';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { TriggerButton } from './components/TriggerButton';
import { ActionButtons } from './components/ActionButtons';

export class Injector {
    private detector: Detector;

    // React Roots
    private triggerRoot: Root | null = null;
    private actionsRoot: Root | null = null;

    // Legacy references needed for closeEditor logic reference
    private currentWrapper: HTMLElement | null = null;
    private currentTarget: HTMLElement | null = null;
    private currentTriggerContainer: HTMLElement | null = null; // Container where trigger renders
    private currentActionsContainer: HTMLElement | null = null; // Container where actions render

    // State tracks
    private hasContent: boolean = false;
    private currentSessionId: string | null = null;
    private currentIframe: HTMLIFrameElement | null = null;

    constructor() {
        this.detector = new Detector();
    }

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
        let container = target.closest('div[role="dialog"]') as HTMLElement;
        if (!container) {
            container = (target.closest('table[role="presentation"]')?.parentElement as HTMLElement) || null;
        }

        if (!container) return;

        // Ensure container is relative so we can float inside it
        if (getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
        }

        // Avoid double injection
        if (container.querySelector('.htemail-trigger-root')) return;

        // Create a root element for React
        const rootEl = document.createElement('div');
        rootEl.className = 'htemail-trigger-root';
        container.appendChild(rootEl); // Append to container

        this.currentTriggerContainer = container;

        // Generate session ID
        const sessionId = Date.now().toString();

        // Mount React Component
        const root = createRoot(rootEl);
        root.render(
            <TriggerButton 
                container={ container }
                onClick = {() => this.replaceEditor(target, rootEl, sessionId)} 
            />
        );
this.triggerRoot = root;
    }

    private handleContentStatus(hasContent: boolean) {
    this.hasContent = hasContent;
    // Re-render actions with new status
    this.renderActionButtons();
}

    private renderActionButtons() {
    if (!this.actionsRoot || !this.currentActionsContainer || !this.currentIframe) {
        return;
    }

    // We act as the binder here.
    this.actionsRoot.render(
        <ActionButtons
                container={ this.currentActionsContainer }
                hasContent = { this.hasContent }
                onInsert = {() => {
        this.currentIframe?.contentWindow?.postMessage({ type: 'HTEMAIL_EXPORT_REQUEST', action: 'insert' }, '*');
    }}
onCopy = { async() => {
    // We wrap the promise so the component can await it
    return new Promise<void>((resolve, reject) => {
        // Temporary Hybrid: Fire request. Injector receives text. Injector copies it. 
        this.currentIframe?.contentWindow?.postMessage({ type: 'HTEMAIL_EXPORT_REQUEST', action: 'copy' }, '*');
        // Resolve immediately so button doesn't spin forever waiting for a promise we can't easily resolve here without strict event id matching.
        resolve();
    });
}}
            />
        );
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
            // The React component self-manages the "Success" state.
            console.log('HTEMAIL: Copied to clipboard');
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

    // Unmount Action Buttons
    if (this.actionsRoot) {
        this.actionsRoot.unmount();
        this.actionsRoot = null;
    }

    // Remove the actions container element if we made one?
    const actionsWrapper = document.getElementById('htemail-actions-root');
    if (actionsWrapper) actionsWrapper.remove();

    if (this.currentTarget) {
        this.currentTarget.style.display = 'block';
        this.currentTarget = null;
    }

    // Reshow trigger (React re-render?)
    const triggerEl = this.currentTriggerContainer?.querySelector('.htemail-trigger-root') as HTMLElement;
    if (triggerEl) {
        triggerEl.style.display = 'block';
    }
}

    private replaceEditor(target: HTMLElement, triggerRootEl: HTMLElement, sessionId: string) {
    console.log('HTEMAIL: Replacing editor', sessionId);
    this.currentTarget = target;
    this.currentSessionId = sessionId;

    // 1. Hide the native editor
    target.style.display = 'none';

    // Hide trigger wrapper
    triggerRootEl.style.display = 'none';

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

    // 3. Iframe
    const iframe = document.createElement('iframe');
    this.currentIframe = iframe;
    iframe.id = 'htemail-iframe';
    iframe.src = chrome.runtime.getURL(`editor.html?sessionId=${sessionId}`);
    iframe.style.cssText = `
            width: 100%;
            height: 100%;
            flex: 1;
            border: none;
            display: block;
        `;

    // 4. Close Button (Keep imperative for simplicity inside wrapper for now)
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

    // Simple JS hover for close button
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = '#fee2e2'; // Light red
        closeBtn.style.color = '#ef4444';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.9)';
        closeBtn.style.color = '#6b7280';
    });

    closeBtn.onclick = () => this.closeEditor();

    wrapper.appendChild(closeBtn);
    wrapper.appendChild(iframe);

    if (target.parentNode) {
        target.parentNode.insertBefore(wrapper, target.nextSibling);
    }

    // 5. Mount Action Buttons (React)
    let container = target.closest('div[role="dialog"]') as HTMLElement;
    if (!container) {
        container = (target.closest('table[role="presentation"]')?.parentElement as HTMLElement) || null;
    }

    if (container) {
        // Create a specific container for our actions so we can unmount cleanly
        const actionsDiv = document.createElement('div');
        actionsDiv.id = 'htemail-actions-root';
        // We append to container so they float relative to dialog
        container.appendChild(actionsDiv);

        this.currentActionsContainer = container; // For ResizeObserver access in component

        const root = createRoot(actionsDiv);
        this.actionsRoot = root;

        // Initial Render
        this.renderActionButtons();
    }
}
}
