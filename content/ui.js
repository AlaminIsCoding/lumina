/**
 * UI Manager (Full Version)
 * Handles Floating Toolbar, Note Input, and Hover Cards.
 */
const UIManager = {
    toolbarElement: null,
    hoverCardElement: null,
    cachedSelection: null, // Stores selection when user focuses on input

    /**
     * Create the Main Toolbar (Colors + Input)
     */
    createToolbar: () => {
        if (UIManager.toolbarElement) return UIManager.toolbarElement;

        const toolbar = document.createElement('div');
        toolbar.id = 'lumina-toolbar';
        
        // --- SECTION A: STANDARD ACTIONS ---
        const actionsDiv = document.createElement('div');
        actionsDiv.id = 'lumina-actions';
        actionsDiv.style.display = 'flex';
        actionsDiv.style.gap = '8px';
        actionsDiv.style.alignItems = 'center';

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
            btn.dataset.color = c.hex;
            actionsDiv.appendChild(btn);
        });

        const divider = document.createElement('div');
        divider.className = 'lumina-divider';
        actionsDiv.appendChild(divider);

        const noteBtn = document.createElement('button');
        noteBtn.className = 'lumina-btn';
        noteBtn.innerHTML = Icons.note;
        noteBtn.title = "Add Note";
        noteBtn.dataset.action = "annotate-mode";
        actionsDiv.appendChild(noteBtn);
        toolbar.appendChild(actionsDiv);

        // --- SECTION B: INPUT MODE (Textarea) ---
        const inputDiv = document.createElement('div');
        inputDiv.id = 'lumina-note-input-container';
        
        const input = document.createElement('textarea');
        input.id = 'lumina-note-input';
        input.placeholder = "Type your note here...";
        
        // Handle Shift+Enter vs Enter
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); 
                UIManager.handleNoteSave();
            }
        });

        const saveBtn = document.createElement('button');
        saveBtn.className = 'lumina-save-btn';
        saveBtn.innerHTML = Icons.check;
        saveBtn.title = "Save Note";
        saveBtn.onclick = () => UIManager.handleNoteSave();

        inputDiv.appendChild(input);
        inputDiv.appendChild(saveBtn);
        toolbar.appendChild(inputDiv);

        document.body.appendChild(toolbar);
        UIManager.toolbarElement = toolbar;
        return toolbar;
    },

    /**
     * Show the Toolbar
     */
    show: (x, y, selectionData) => {
        if (!UIManager.toolbarElement) UIManager.createToolbar();
        
        // Cache selection because clicking the input will lose it
        UIManager.cachedSelection = selectionData;

        // Reset UI to color mode
        UIManager.toggleInputMode(false);

        const toolbar = UIManager.toolbarElement;
        requestAnimationFrame(() => {
            toolbar.style.left = `${x}px`;
            toolbar.style.top = `${y}px`;
            toolbar.classList.add('visible');
        });
    },

    hide: () => {
        if (UIManager.toolbarElement) {
            UIManager.toolbarElement.classList.remove('visible');
            document.getElementById('lumina-note-input').value = '';
            UIManager.cachedSelection = null;
        }
    },

    toggleInputMode: (showInput) => {
        const actions = document.getElementById('lumina-actions');
        const inputDiv = document.getElementById('lumina-note-input-container');
        const inputField = document.getElementById('lumina-note-input');

        if (showInput) {
            actions.style.display = 'none';
            inputDiv.style.display = 'flex';
            inputField.focus();
        } else {
            actions.style.display = 'flex';
            inputDiv.style.display = 'none';
        }
    },

    handleNoteSave: async () => {
        const input = document.getElementById('lumina-note-input');
        const noteText = input.value.trim();
        
        if (noteText && UIManager.cachedSelection) {
            await LuminaController.createHighlight("#ffeb3b", noteText, UIManager.cachedSelection);
        }
        UIManager.hide();
    },

    // ========================================================
    // HOVER CARD LOGIC
    // ========================================================

    createHoverCard: () => {
        if (UIManager.hoverCardElement) return UIManager.hoverCardElement;

        const card = document.createElement('div');
        card.id = 'lumina-hover-card';
        
        card.innerHTML = `
            <div class="lumina-card-note" id="lumina-card-text"></div>
            <div class="lumina-card-footer">
                <button class="lumina-card-delete" id="lumina-card-delete-btn">
                    ${Icons.trash} Delete
                </button>
            </div>
        `;

        card.addEventListener('mousedown', (e) => e.stopPropagation());

        document.body.appendChild(card);
        UIManager.hoverCardElement = card;
        return card;
    },

    showHoverCard: (x, y, note, highlightId) => {
        if (!UIManager.hoverCardElement) UIManager.createHoverCard();
        
        const card = UIManager.hoverCardElement;
        const textEl = document.getElementById('lumina-card-text');
        const deleteBtn = document.getElementById('lumina-card-delete-btn');

        // Logic: Check if note exists
        if (note && note.trim().length > 0) {
            // Standard View (Scrollable Note)
            card.classList.remove('compact');
            textEl.style.display = 'block';
            textEl.textContent = note;
        } else {
            // Compact View (Just Delete Button)
            card.classList.add('compact');
            textEl.style.display = 'none';
        }

        // Handle Delete Action (Clone to remove old listeners)
        const newDeleteBtn = deleteBtn.cloneNode(true);
        deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
        
        newDeleteBtn.onclick = async () => {
            if (confirm("Delete this highlight?")) {
                await StorageManager.removeHighlight(window.location.href, highlightId);
                
                // Visually remove
                const mark = document.querySelector(`mark[data-id="${highlightId}"]`);
                if (mark) {
                    const parent = mark.parentNode;
                    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
                    parent.removeChild(mark);
                }
                UIManager.hideHoverCard();

                const updatedList = await StorageManager.getHighlights(window.location.href);
                if (typeof Navigator !== 'undefined') {
                    Navigator.update(updatedList);
                }
            }
        };

        requestAnimationFrame(() => {
            card.style.left = `${x}px`;
            card.style.top = `${y + 15}px`;
            card.classList.add('visible');
        });
    },

    hideHoverCard: () => {
        if (UIManager.hoverCardElement) {
            UIManager.hoverCardElement.classList.remove('visible');
        }
    }
};
