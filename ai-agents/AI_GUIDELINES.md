# AI Guidelines

This document outlines how AI agents should interact with the HTEMAIL codebase.

## 1. Interaction Rules

-   **Read First**: Always read `ARCHITECTURE.md` and `SPEC.MD` (in `ai-agents/`) before proposing significant architectural changes.
-   **Typesafety**: Do not bypass TypeScript checks. If types are missing, define them.
-   **File Structure**: Respect the module boundaries defined in `src/`. Do not create top-level directories without strong justification.

## 2. Coding Patterns

-   **React**: Use functional components. Prefer small, composable components over monolithic ones.
-   **State Management**: Use React Context for global UI state (Editor open/close), but keep Editor content state within the Milkdown or specialized store.
-   **Styling**: Use Tailwind classes. Avoid inline `style={{}}` tags in React components *unless* it is for the *Renderer* logic that generates the final email HTML.
    -   *Distinction*: The **Editor UI** uses classes. The **Output HTML** uses inline styles.

## 3. Refactoring

-   If a file exceeds 300 lines, consider breaking it down.
-   When modifying the **Injector**, verify that selectors are specific enough to avoid collateral damage on the host page.

## 4. Security

-   **Content Security Policy (CSP)**: Be mindful of MV3 CSP restrictions. No `eval()` or remote code execution.
-   **Sanitization**: All user input that ends up in the HTML export must be sanitized (though we want to allow standard HTML attributes, script injection must be prevented).
