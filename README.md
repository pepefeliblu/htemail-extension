# HTEMAIL - Visual HTML Email Builder Extension

**HTEMAIL** is a fully open-source Chrome extension that injects a visual HTML email builder directly into Gmail, Outlook Web, and other major email providers. It empowers users to create responsive, production-ready HTML email templates without leaving their inbox.

## 🚀 Features

- **Visual Email Editor**: Powered by [Milkdown](https://milkdown.dev/), a WYSIWYG editor with custom blocks for email structures.
- **In-Inbox Injection**: Works directly inside Gmail, Outlook, Yahoo, and ProtonMail.
- **Responsive HTML Export**: Generates table-based HTML with inline CSS for maximum client compatibility.
- **Template Management**: Save, load, and manage your email templates locally.
- **Smart CSS Inliner**: Automatically converts styles to inline CSS, handling tricky email client quirks.

## 🛠 Tech Stack

- **Core**: Chrome Extension (Manifest V3)
- **Language**: TypeScript
- **Framework**: React (for UI components)
- **Editor**: Milkdown (Headless WYSIWYG)
- **Styling**: TailwindCSS
- **Build Tool**: Vite

## 📂 Project Structure

```
/
├── src/
│   ├── background/      # Extension background scripts
│   ├── content/         # Content scripts (injection logic)
│   ├── popup/           # Extension popup UI
│   ├── editor/          # Milkdown editor & UI components
│   ├── lib/             # Core logic (Renderer, Inliner, Blocks)
│   └── assets/          # Static assets
├── ai-agents/           # AI collaboration guidelines
├── public/              # Manifest and public assets
└── ...
```

## 📦 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/HTEMAIL/htemail-extension.git
   cd htemail-extension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load into Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## 🧪 Running Tests

```bash
npm test
```

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute to this project.

## 📄 License

MIT License
