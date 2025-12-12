import { Detector } from './Detector';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { TriggerButton } from './components/TriggerButton';
import { ActionButtons } from './components/ActionButtons';
import { ComposeOverlay } from './components/ComposeOverlay';

export class Injector {
    private readonly detector: Detector;

    // React Roots
    private triggerRoot: Root | null = null;
    private actionsRoot: Root | null = null;
    private overlayRoot: Root | null = null;

    // Legacy references needed for closeEditor logic reference
    private currentTarget: HTMLElement | null = null;
    private currentTriggerContainer: HTMLElement | null = null; // Container where trigger renders
    private currentActionsContainer: HTMLElement | null = null; // Container where actions render
    private overlayHost: HTMLElement | null = null; // The host div for the overlay

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
                container={container}
                onClick={() => this.replaceEditor(target, rootEl, sessionId)}
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
                container={this.currentActionsContainer}
                hasContent={this.hasContent}
                onInsert={() => {
                    this.currentIframe?.contentWindow?.postMessage({ type: 'HTEMAIL_EXPORT_REQUEST', action: 'insert' }, '*');
                }}
                onCopy={async () => {
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
            if (this.currentTarget) {
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
        // Unmount Overlay
        if (this.overlayRoot) {
            this.overlayRoot.unmount();
            this.overlayRoot = null;
        }

        // Remove the overlay host element
        if (this.overlayHost) {
            this.overlayHost.remove();
            this.overlayHost = null;
        }

        this.currentIframe = null;

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

        // Reshow trigger
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

        // 2. Create the host for our overlay (replaces "wrapper" creation)
        const overlayHost = document.createElement('div');
        overlayHost.id = 'htemail-overlay-root';
        // We insert it where the wrapper used to be
        if (target.parentNode) {
            target.parentNode.insertBefore(overlayHost, target.nextSibling);
        }
        this.overlayHost = overlayHost;

        // 3. Mount React Overlay
        const root = createRoot(overlayHost);
        this.overlayRoot = root;

        root.render(
            <ComposeOverlay
                sessionId={sessionId}
                onClose={() => this.closeEditor()}
                onIframeMount={(iframe) => {
                    this.currentIframe = iframe;
                    // Once iframe is available, we might want to check actions,
                    // though usually actions wait for user interaction or layout.
                    // But if we need to re-render actions because they depend on iframe presence:
                    this.renderActionButtons();
                }}
            />
        );

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

            const actionRoot = createRoot(actionsDiv);
            this.actionsRoot = actionRoot;

            // Initial Render
            this.renderActionButtons();
        }
    }
}
