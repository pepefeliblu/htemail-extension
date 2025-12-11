# Project Goals & Vision

## core Purpose
To democratize high-quality HTML email creation by bringing a professional builder directly into the email client, removing the friction of external tools and export/import loops.

## Vision
HTEMAIL aims to be the standard open-source solution for in-browser email authoring. We value:
-   **Privacy**: No external servers for data processing.
-   **Compatibility**: Output that works on 99% of email clients.
- [x] **Core Editor**: Milkdown integration with basic formatting.
- [x] **Gmail Injection**: Basic detection of compose window.
- [x] **Floating UI**: Non-intrusive floating trigger and control buttons.
- [x] **Smart Visibility**: UI elements that respect the user's workflow.
- [x] **HTML Export**: Convert markdown to table-based HTML.
- [x] **Copy & Insert**: Flexible export options.

## Roadmap (3-6 Months)

1.  **MVP Release (v1.0)**
    -   Stable injection in Gmail & Outlook.
    -   Core blocks: Text, Image, Button, Columns.
    -   Basic HTML Export.

2.  **Template Ecosystem (v1.1)**
    -   Community template gallery.
    -   Import/Export of templates (JSON).

3.  **Advanced Blocks (v1.2)**
    -   Social Layouts.
    -   Video thumbnails (gif fallback).
    -   Dynamic content placeholders (Handlebars/Liquids syntax support).

4.  **Cross-Browser Support**
    -   Firefox Add-on.
    -   Safari Extension.

## Out of Scope
-   **Email Sending Service**: We do not send emails. We only build the HTML for the existing client to send.
-   **Cloud Hosting**: We do not host images or assets. Images should be base64 (small) or hosted by the user/external URLs.
