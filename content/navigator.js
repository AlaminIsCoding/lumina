/**
 * Navigator Widget
 * A floating "Table of Contents" for highlights on the current page.
 */
const Navigator = {
  element: null,
  listElement: null,
  highlights: [], // Local copy of data

  /**
   * Initialize or Update the Navigator with new data
   */
  update: (highlightList) => {
    Navigator.highlights = highlightList || [];
    Navigator.render();
  },

  /**
   * Create the DOM elements (run once)
   */
  createUI: () => {
    if (Navigator.element) return;

    // Container
    const container = document.createElement("div");
    container.id = "lumina-navigator";

    // The List (Hidden by default)
    const list = document.createElement("div");
    list.id = "lumina-navigator-list";
    container.appendChild(list);

    // The Pill (Always visible if notes exist)
    const pill = document.createElement("div");
    pill.id = "lumina-navigator-pill";
    pill.innerHTML = `
            <span id="lumina-nav-count">0</span>
            <span style="font-size:12px; margin-left:4px">Notes</span>
        `;

    // Toggle List on click
    pill.addEventListener("click", () => {
      container.classList.toggle("expanded");
    });

    container.appendChild(pill);
    document.body.appendChild(container);

    Navigator.element = container;
    Navigator.listElement = list;
  },

  /**
   * Render the list items based on current highlights
   */
  render: () => {
    // If no highlights, hide the whole widget
    if (!Navigator.highlights || Navigator.highlights.length === 0) {
      if (Navigator.element) Navigator.element.style.display = "none";
      return;
    }

    // Ensure UI exists
    Navigator.createUI();
    Navigator.element.style.display = "flex"; // Show it

    // Update Count
    document.getElementById("lumina-nav-count").textContent =
      Navigator.highlights.length;

    // Update List
    Navigator.listElement.innerHTML = "";

    // Sort highlights by their position on the page (top to bottom)
    const sorted = [...Navigator.highlights].sort((a, b) => {
      return a.startOffset - b.startOffset;
      // Note: A robust sort would compare DOM position, but this is a decent proxy for MVP
    });

    sorted.forEach((h) => {
      const item = document.createElement("div");
      item.className = "lumina-nav-item";

      // Show icon if it has a note
      const icon = h.note ? "📝 " : "";
      item.textContent =
        icon + (h.text.substring(0, 30) + (h.text.length > 30 ? "..." : ""));

      // Color indicator
      item.style.borderLeft = `3px solid ${h.color || "#ffeb3b"}`;

      // Click -> Scroll Logic
      item.addEventListener("click", () => {
        const mark = document.querySelector(`mark[data-id="${h.id}"]`);
        if (mark) {
          mark.scrollIntoView({ behavior: "smooth", block: "center" });
          // Flash the mark to show user where they landed
          mark.style.transition = "transform 0.3s";
          mark.style.transform = "scale(1.2)";
          setTimeout(() => (mark.style.transform = "scale(1)"), 300);
        }
      });

      Navigator.listElement.appendChild(item);
    });
  },
};
