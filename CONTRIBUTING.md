# Contributing to HTEMAIL

We welcome contributions to the HTEMAIL project! Here are some guidelines to help you get started.

## Development Workflow

1.  **Fork the repository** and clone it locally.
2.  **Install dependencies**:
    ```bash
    npm install
    # or
    pnpm install
    ```
3.  **Create a branch** for your feature or fix:
    ```bash
    git checkout -b feature/my-new-feature
    ```
4.  **Make your changes**. Ensure you follow the coding style (Prettier/ESLint Configs are included).
5.  **Build and Test**:
    ```bash
    npm run build
    npm test
    ```
6.  **Load the extension** in Chrome Developer Mode to verify changes manually.

## Coding Standards

-   **TypeScript**: We use strict TypeScript. Avoid `any` where possible.
-   **Components**: Functional React components with Hooks.
-   **Styling**: utility-first with TailwindCSS.
-   **Commits**: Please use [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat: add spacer block`, `fix: gmail injection selector`).

## Adding New Blocks

If you are adding a new email block (e.g., a Countdown Timer):
1.  Define the Block Schema in `src/lib/blocks/`.
2.  Create the Milkdown plugin in `src/editor/plugins/`.
3.  Update the Renderer to handle the AST node for this block.
4.  Add a property panel section if specific configurations are needed.

## Pull Requests

-   Open a PR against the `main` branch.
-   Provide a clear description of the problem and solution.
-   Include screenshots/videos for UI changes.
