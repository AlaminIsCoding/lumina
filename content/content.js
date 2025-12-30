console.log("Lumina: Content script loaded.");

const LuminaController = {
  // Tracks if we are currently hovering over our own toolbar
  isInteractingWithToolbar: false,

  /**
   * Initialize the extension
   */
  init: async () => {
    // 1. Initialize UI
    const toolbar = UIManager.createToolbar();
    LuminaController.attachToolbarListeners(toolbar);
    LuminaController.attachPageListeners();

    // 2. Load Saved Data
    const currentUrl = window.location.href;
    const savedHighlights = await StorageManager.getHighlights(currentUrl);

    if (savedHighlights.length > 0) {
      savedHighlights.forEach((data) => {
        Highlighter.drawHighlight(data.id, data.color, data);
      });
    }

    Navigator.update(savedHighlights);
  },

  attachToolbarListeners: (toolbar) => {
    toolbar.addEventListener("mousedown", (e) => e.preventDefault());

    toolbar.addEventListener("mouseenter", () => {
      LuminaController.isInteractingWithToolbar = true;
    });
    toolbar.addEventListener("mouseleave", () => {
      LuminaController.isInteractingWithToolbar = false;
    });

    toolbar.addEventListener("click", async (e) => {
      e.stopPropagation();

      // Color Click
      const colorBtn = e.target.closest(".lumina-color-btn");
      if (colorBtn) {
        const color = colorBtn.dataset.color;
        await LuminaController.createHighlight(color);
        UIManager.hide();
        return;
      }

      // Note Button Click -> Switch to Input Mode
      const noteBtn = e.target.closest('[data-action="annotate-mode"]');
      if (noteBtn) {
        // Do NOT create highlight yet. Just show the input box.
        UIManager.toggleInputMode(true);
      }
    });
  },

  /**
   * Event Listeners for the Web Page
   */
  attachPageListeners: () => {
    // MOUSE UP
    document.addEventListener("mouseup", (e) => {
      setTimeout(() => {
        const selection = window.getSelection();

        // CAPTURE DATA NOW
        const payload = Highlighter.captureSelection();

        if (payload && !selection.isCollapsed) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const x = rect.left + rect.width / 2 - 80;
          const y = rect.top + window.scrollY - 50;

          // PASS DATA TO UI MANAGER
          UIManager.show(x, y, payload);
        }
      }, 10);
    });

    // MOUSE DOWN
    document.addEventListener("mousedown", (e) => {
      if (!LuminaController.isInteractingWithToolbar) {
        UIManager.hide();
      }
    });
    let hoverTimeout;

    document.addEventListener("mouseover", (e) => {
      // Check if we are hovering a highlighted element
      if (e.target.classList.contains("lumina-highlight")) {
        clearTimeout(hoverTimeout); // Cancel any hide timer

        const mark = e.target;
        const rect = mark.getBoundingClientRect();
        const note = mark.dataset.note;
        const id = mark.dataset.id;

        // Show card if there is a note, OR we could show it for all to allow delete
        // Let's show for all, but text differs if no note.
        UIManager.showHoverCard(
          rect.left + window.scrollX,
          rect.bottom + window.scrollY,
          note,
          id,
        );
      } else if (e.target.closest("#lumina-hover-card")) {
        // If hovering the card itself, keep it open
        clearTimeout(hoverTimeout);
      }
    });

    document.addEventListener("mouseout", (e) => {
      if (
        e.target.classList.contains("lumina-highlight") ||
        e.target.closest("#lumina-hover-card")
      ) {
        // Delay hiding to allow moving mouse from mark to card
        hoverTimeout = setTimeout(() => {
          UIManager.hideHoverCard();
        }, 300);
      }
    });
  },

  /**
   * Create and Save Highlight
   */
  createHighlight: async (
    color = "#ffeb3b",
    note = "",
    cachedPayload = null,
  ) => {
    // Use cached payload if provided, otherwise try to capture live
    const selectionData = cachedPayload || Highlighter.captureSelection();

    if (!selectionData) {
      console.log("Lumina: No valid selection found to highlight.");
      return;
    }

    const newHighlight = {
      ...selectionData,
      color: color,
      note: note,
    };

    const savedRecord = await StorageManager.addHighlight(
      window.location.href,
      newHighlight,
    );
    Highlighter.drawHighlight(savedRecord.id, savedRecord.color, savedRecord);
    window.getSelection().removeAllRanges();

    const allHighlights = await StorageManager.getHighlights(
      window.location.href,
    );
    Navigator.update(allHighlights);

    return savedRecord;
  },
};

// Start
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", LuminaController.init);
} else {
  LuminaController.init();
}
