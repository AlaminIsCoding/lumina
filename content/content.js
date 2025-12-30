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
            savedHighlights.forEach(data => {
                Highlighter.drawHighlight(data.id, data.color, data);
            });
        }
    },

/**
     * Event Listeners for the Toolbar Buttons
     */
    attachToolbarListeners: (toolbar) => {
        // --- CRITICAL FIX ---
        // Prevent the toolbar from "stealing" focus when clicked.
        // This ensures the text remains selected on the page.
        toolbar.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });

        // Track hover state
        toolbar.addEventListener('mouseenter', () => { LuminaController.isInteractingWithToolbar = true; });
        toolbar.addEventListener('mouseleave', () => { LuminaController.isInteractingWithToolbar = false; });

        // Handle button clicks
        toolbar.addEventListener('click', async (e) => {
            e.stopPropagation(); // Stop click from bubbling to page
            
            // Check if a color circle was clicked
            const colorBtn = e.target.closest('.lumina-color-btn');
            if (colorBtn) {
                const color = colorBtn.dataset.color;
                await LuminaController.createHighlight(color);
                UIManager.hide();
                return;
            }

            // Check if note button was clicked
            const noteBtn = e.target.closest('[data-action="annotate"]');
            if (noteBtn) {
                // Temporarily store selection because prompt() might clear it in some browsers
                const note = prompt("Enter your note:"); 
                if (note !== null) {
                    await LuminaController.createHighlight("#ffeb3b", note);
                }
                UIManager.hide();
            }
        });
    },

    /**
     * Event Listeners for the Web Page
     */
    attachPageListeners: () => {
        // 1. MOUSE UP: Detect text selection
        document.addEventListener('mouseup', (e) => {
            // Wait slightly for selection to finalize
            setTimeout(() => {
                const selection = window.getSelection();
                
                // Use the capture method from Phase 2a to validate selection
                const payload = Highlighter.captureSelection();

                if (payload && !selection.isCollapsed) {
                    // Valid selection found!
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    
                    // Calculate position (centered above selection)
                    // We add window.scrollY to account for scrolling
                    const x = rect.left + (rect.width / 2) - (80); // 80 is approx half toolbar width
                    const y = rect.top + window.scrollY - 50; // 50px above text

                    UIManager.show(x, y);
                }
            }, 10);
        });

        // 2. MOUSE DOWN: Hide toolbar if clicking away
        document.addEventListener('mousedown', (e) => {
            if (!LuminaController.isInteractingWithToolbar) {
                UIManager.hide();
            }
        });
    },

    /**
     * Core Action: Create and Save Highlight
     */
    createHighlight: async (color = "#ffeb3b", note = "") => {
        const selectionData = Highlighter.captureSelection();
        
        if (!selectionData) return;

        const newHighlight = {
            ...selectionData,
            color: color,
            note: note
        };

        const savedRecord = await StorageManager.addHighlight(window.location.href, newHighlight);
        
        // Draw visually
        Highlighter.drawHighlight(savedRecord.id, savedRecord.color, savedRecord);

        // Clear selection
        window.getSelection().removeAllRanges();
        
        return savedRecord;
    }
};

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', LuminaController.init);
} else {
    LuminaController.init();
}
