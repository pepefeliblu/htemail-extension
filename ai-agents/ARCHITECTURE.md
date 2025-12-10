# Architecture Documentation

This document describes the high-level architecture of the HTEMAIL Chrome Extension.

## 1. High-Level Overview

HTEMAIL operates as a Chrome Extension using Manifest V3. It interacts with web pages (Gmail, Outlook) via Content Scripts and manages state/windows via Background Service Workers.

### Core Modules

1.  **Content Script (`src/content/`)**:
    -   Detects the active email client (Gmail, Outlook, etc.).
    -   Injects the "Open Builder" button into the DOM.
    -   Handles communication between the host page and the extension.
    -   Inserts the generated HTML into the email draft.

2.  **Editor App (`src/editor/`)**:
    -   A React application hosting the Milkdown editor.
    -   Lives inside a Shadow DOM or an Iframe injected by the Content Script to avoid CSS conflicts.
    -   Manages the Block System (Text, Image, Columns, etc.).
    -   Handles properties panel and state.

3.  **Core Logic (`src/lib/`)**:
    -   **Renderer**: traversing the editor AST and generating HTML table structures.
    -   **Inliner**: Processing CSS into inline styles.
    -   **Storage**: Wrapper around `chrome.storage` or `IndexedDB` for templates.

4.  **Background Script (`src/background/`)**:
    -   Handles installation events.
    -   Manages context menus (if any).
    -   (Optional) Orchestrates complex data persistence if needed.

## 2. Data Flow

### Injection Flow
1.  User opens Gmail Composer.
2.  `content/injector.ts` detects the compose window selector.
3.  Injects a button.
4.  User clicks Button -> Content Script opens the Editor Overlay.

### Editing & Export Flow
1.  User edits content in Milkdown (Markdown/DOM based state).
2.  User clicks "Export" or "Insert".
3.  **AST Transformation**: Editor state is converted to a custom AST.
4.  **HTML Generation**: AST is passed to the `Renderer`.
5.  **Inlining**: Generated HTML is passed to `juicer` or similar inliner.
6.  **Insertion**: Final HTML string is sent to Content Script -> inserted into Gmail's `contenteditable` div.

## 3. Technology Decisions

-   **Milkdown**: Chosen for its modularity and plugin system, allowing us to define custom blocks easily.
-   **React**: For the complex UI of the property panels and editor wrapper.
-   **TailwindCSS**: For rapid UI development within the extension (scoped to Shadow DOM/Iframe).
-   **Manifest V3**: Required for modern Chrome Extensions.

## 4. Directory Structure

```
src/
  background/
  content/
  editor/
    components/
    plugins/  (Milkdown custom plugins)
  lib/
    attributes/ (Safe attribute lists)
    blocks/     (Block definitions)
    inliner/
    renderer/
```
