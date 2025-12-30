/**
 * UI Manager
 * Handles the creation and rendering of the floating toolbar.
 */
const UIManager = {
    toolbarElement: null,

    /**
     * Create the DOM elements for the toolbar and inject them into the page.
     * We do this once when the page loads.
     */
    createToolbar: () => {
        if (UIManager.toolbarElement) return; // Already created

        const toolbar = document.createElement('div');
        toolbar.id = 'lumina-toolbar';
        
        // --- 1. Color Pickers ---
        const colors = [
            { name: 'yellow', hex: '#ffeb3b' },
            { name: 'green', hex: '#a5d6a7' },
            { name: 'blue', hex: '#90caf9' },
            { name: 'pink', hex: '#f48fb1' }
        ];

        colors.forEach(c => {
            const btn = document.createElement('div');
            btn.className = 'lumina-color-btn';
            btn.style.backgroundColor = c.hex;
            // We attach the data directly to the DOM element for easy access later
            btn.dataset.color = c.hex;
            toolbar.appendChild(btn);
        });

        // --- 2. Divider ---
        const divider = document.createElement('div');
        divider.className = 'lumina-divider';
        toolbar.appendChild(divider);

        // --- 3. Action Buttons (Note icon) ---
        // (Using the Icons object we created in Phase 1)
        const noteBtn = document.createElement('button');
        noteBtn.className = 'lumina-btn';
        noteBtn.innerHTML = Icons.note; // From utils/icons.js
        noteBtn.title = "Add Note";
        noteBtn.dataset.action = "annotate";
        toolbar.appendChild(noteBtn);

        // Inject into body
        document.body.appendChild(toolbar);
        UIManager.toolbarElement = toolbar;
        
        return toolbar;
    },

    /**
     * Move the toolbar to specific coordinates and show it.
     */
    show: (x, y) => {
        if (!UIManager.toolbarElement) UIManager.createToolbar();
        
        const toolbar = UIManager.toolbarElement;
        
        // Position math to center it above the selection
        // We defer layout slightly to ensure dimensions are calculated
        requestAnimationFrame(() => {
            toolbar.style.left = `${x}px`;
            toolbar.style.top = `${y}px`; // Just a bit above
            toolbar.classList.add('visible');
        });
    },

    /**
     * Hide the toolbar
     */
    hide: () => {
        if (UIManager.toolbarElement) {
            UIManager.toolbarElement.classList.remove('visible');
        }
    }
};
