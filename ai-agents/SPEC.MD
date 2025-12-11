# HTEMAIL — Specification Sheet (v1.1)

A fully open-source Chrome extension for visually building cross-client HTML email templates directly inside Gmail, Outlook Web, and other major email providers.

Repository: **HTEMAIL/htemail-extension**

---

## 1. Overview

**HTEMAIL** is an open-source, extension-first project that injects a visual HTML email builder into the UI of major webmail clients.  
The tool enables UX designers, marketers, and frontend developers to visually construct responsive HTML email templates and export production-ready markup that works across Gmail, Outlook, Yahoo, and more.

The editor is powered by **Milkdown**, enhanced with a custom block system, and compiled through a **table-based HTML email renderer with inline CSS** for maximum compatibility.

### Why an extension?
- Works directly *inside* Gmail / Outlook — no switching tabs.
- Zero backend, zero hosting cost.
- Trust & transparency from being open-source.
- Easy for community contributions (templates, blocks, features).

---

## 2. Core Features

### 2.1 Visual Email Editor
- Milkdown-based WYSIWYG editor.
- Custom HTEMAIL blocks:
    - Text
    - Headings
    - Images
    - Buttons
    - Columns (2 / 3)
    - Divider
    - Spacer
    - Footer blocks
    - Social icons
- Right-side property panel for:
    - Color pickers
    - Padding/margin
    - Typographic controls
    - Layout alignment
    - Background settings
    - Button styles

### 2.2 Email Client Injection
- Detects the compose area in:
    - **Gmail Web**
    - **Outlook Web** (Planned)
    - **Yahoo Mail** (Planned)
- Adds a **Floating HTEMAIL Trigger** to the bottom-right of the compose window.
- Opens an overlay with the full editor.
- **Smart Control Visibility**: "Insert" and "Copy" buttons remain hidden until content is added.

### 2.3 HTML Export
- One-click export options.
- Output:
    - Table-based layout
    - Inline CSS for compatibility
    - Responsive fallback for mobile
    - Base font stack
- Export modes:
    - **Insert**: Inject directly into the email body.
    - **Copy**: Copy raw HTML to clipboard.

### 2.4 Templates
- Saved to browser storage (IndexedDB or localStorage).
- CRUD template management UI.
- Built-in templates:
    - Welcome email
    - Newsletter structure
    - Promo/feature announcement
    - Minimalist transactional

### 2.5 CSS Inliner
- Converts all block-level CSS → inline CSS.
- Removes unsupported selectors.
- Applies email-safe defaults.
- Handles:
    - Table alignment hacks
    - `<center>` fallbacks
    - Outlook-specific quirks

---

## 3. Tech Stack

### 3.1 Core
- Chrome Extension (Manifest v3)
- TypeScript
- Milkdown
- Vanilla JS or React (optional for UI)
- TailwindCSS or CSS modules (extension UI only)

### 3.2 Optional Future Ecosystem (npm packages)
To support wider adoption and modularity:

1. **htemail-renderer**  
   Pure function → HTEMAIL AST → HTML email tables

2. **htemail-inliner**  
   Pure function → Inline CSS compatible with email clients

3. **htemail-blocks**  
   Schema definitions + TypeScript interfaces for HTEMAIL blocks

> The extension remains the **core OSS deliverable**, but additional packages enable programmatic use by other tools.

---

## 4. Architecture

### 4.1 Chrome Extension Structure
