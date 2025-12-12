export class Detector {
    private static readonly GMAIL_COMPOSE_SELECTOR = 'div[role="dialog"] div[role="textbox"][contenteditable="true"], div[role="main"] div[role="textbox"][contenteditable="true"]';
    private static readonly OUTLOOK_COMPOSE_SELECTOR = 'div[role="textbox"][contenteditable="true"][aria-label*="Message body"]';

    private observer: MutationObserver | null = null;
    private callbacks: Array<(element: HTMLElement) => void> = [];

    public start(callback: (element: HTMLElement) => void) {
        this.callbacks.push(callback);
        this.observer = new MutationObserver(this.handleMutations.bind(this));
        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        // Initial check
        this.handleMutations([]);
    }

    private handleMutations(mutations: MutationRecord[]) {
        const potentialElements = document.querySelectorAll(
            `${Detector.GMAIL_COMPOSE_SELECTOR}, ${Detector.OUTLOOK_COMPOSE_SELECTOR}`
        );

        potentialElements.forEach((el) => {
            const element = el as HTMLElement;
            // Avoid re-processing
            if (element.dataset.htemailDetected) return;

            element.dataset.htemailDetected = 'true';
            this.callbacks.forEach(cb => cb(element));
        });
    }

    public stop() {
        this.observer?.disconnect();
        this.callbacks = [];
    }
}
