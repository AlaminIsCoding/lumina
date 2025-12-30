# Lumina - Web Highlighter & Annotator

<div align="center">
  <img src="icons/icon128.png" alt="Lumina Logo" width="100" height="100">
  <br>
  <b>Illuminating the web, one highlight at a time.</b>
  <br>
  <br>
  
  [![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue?style=flat-square)](https://developer.chrome.com/docs/extensions/mv3/intro/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
  [![Chrome](https://img.shields.io/badge/Chrome-Extension-green?style=flat-square&logo=google-chrome&logoColor=white)]()
</div>

---

## 📖 Overview

**Lumina** is a lightweight, privacy-focused Chrome Extension that allows you to highlight text and add sticky notes to any webpage. 

Unlike other highlighting tools that require accounts or cloud sync, Lumina runs **100% locally**. Your data is stored securely in your browser's local storage, ensuring your reading habits remain private. It features a modern floating UI, a dedicated dashboard for reviewing notes, and a "Navigator" widget for long articles.

## ✨ Key Features

*   **🎨 Multi-Color Highlighting:** Choose from Yellow, Green, Blue, or Pink to categorize your thoughts.
*   **📝 Inline Annotations:** Add notes to any highlight. Hover over text to read or delete notes instantly.
*   **📂 Organized Dashboard:** A dedicated full-page view to manage all your highlights, grouped by website domain.
*   **🧭 The Navigator:** A floating "Table of Contents" widget on web pages that helps you jump between highlights in long articles.
*   **🔍 Global Search:** Instantly find any note or highlighted text across your entire history.
*   **🔒 Privacy First:** No backend, no tracking, no accounts. Data lives in `chrome.storage.local`.
*   **⚡ Smart Anchoring:** Uses robust DOM pathing to ensure highlights stick even if the page structure changes slightly.

## 🚀 Installation (Developer Mode)

Since this is a personal project, it is installed via Chrome's "Developer Mode".

1.  **Clone or Download** this repository.
    ```bash
        https://github.com/AlaminIsCoding/lumina.git
    ```
2.  Open Google Chrome and navigate to `chrome://extensions`.
3.  Toggle **Developer mode** in the top right corner.
4.  Click **Load unpacked**.
5.  Select the folder where you cloned/downloaded this repository.
6.  Lumina is now active! Pin it to your toolbar for easy access.

## 🛠️ Usage Guide

### 1. Highlighting & Notes
*   Select any text on a webpage.
*   A **Floating Toolbar** will appear.
*   Click a **Color Circle** to simply highlight.
*   Click the **Note Icon** (📝) to add a text annotation.
    *   *Pro Tip:* Press `Shift + Enter` in the note box for a new line.

### 2. Reviewing & Deleting
*   **Hover** over any highlighted text to see your note.
*   Click the **Delete** button in the hover card to remove it.
*   Look for the **Navigator Pill** in the bottom-right corner to see a summary of all notes on the current page.

### 3. The Dashboard
*   Click the Lumina icon in your Chrome Toolbar to open the **Dashboard**.
*   Browse highlights by website in the sidebar.
*   Use the search bar to filter notes by text or URL.

## 🏗️ Project Structure

Lumina follows a modular "Service-based" architecture for maintainability.

```text
/lumina-highlighter
├── /manifest.json          # Configuration & Permissions
├── /background/
│   └── background.js       # Service worker (Extension events)
├── /content/               # Content Scripts (Runs on webpages)
│   ├── content.js          # Event listeners & logic glue
│   ├── highlighter.js      # Logic for DOM range serialization
│   ├── ui.js               # Generates Toolbars & Hover cards
│   ├── navigator.js        # "Fast Travel" widget logic
│   └── styles.css          # UI Styling
├── /dashboard/             # The Organizer Page
│   ├── dashboard.html
│   ├── dashboard.css
│   └── dashboard.js
└── /utils/
    ├── storage.js          # Wrapper for chrome.storage.local
    └── icons.js            # SVG Icon collection
```

## 🔮 Future Roadmap

*   [ ] **PDF Support:** Enable highlighting on local PDF files.
*   [ ] **Dark Mode:** Full dark mode support for the Dashboard.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with Vanilla JS, HTML, and CSS. No frameworks attached.</sub>
</div>
