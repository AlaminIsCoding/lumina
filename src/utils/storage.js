/**
 * StorageManager
 * Handles all interactions with chrome.storage.local.
 * Data Schema:
 * {
 *   "https://example.com/page1": [ {HighlightObject}, {HighlightObject} ],
 *   "https://google.com/search": [ ... ]
 * }
 */
const StorageManager = {
    
    /**
     * Generate a unique ID for a new highlight
     */
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    },

    /**
     * Add a highlight to the current URL
     * @param {string} url - The page URL (key)
     * @param {object} highlightData - The data payload
     */
    addHighlight: async (url, highlightData) => {
        const cleanUrl = url.split('#')[0]; // Ignore hash fragments
        const existing = await StorageManager.getHighlights(cleanUrl);
        
        // Add ID and Timestamp if missing
        if (!highlightData.id) highlightData.id = StorageManager.generateId();
        if (!highlightData.createdAt) highlightData.createdAt = Date.now();

        const updated = [...existing, highlightData];
        
        await chrome.storage.local.set({ [cleanUrl]: updated });
        return highlightData;
    },

    /**
     * Get all highlights for a specific URL
     */
    getHighlights: (url) => {
        return new Promise((resolve) => {
            const cleanUrl = url.split('#')[0];
            chrome.storage.local.get([cleanUrl], (result) => {
                resolve(result[cleanUrl] || []);
            });
        });
    },

    /**
     * Remove a specific highlight by ID
     */
    removeHighlight: async (url, highlightId) => {
        const cleanUrl = url.split('#')[0];
        const existing = await StorageManager.getHighlights(cleanUrl);
        const updated = existing.filter(h => h.id !== highlightId);

        // If list is empty, we can optionally remove the key entirely
        if (updated.length === 0) {
            await chrome.storage.local.remove(cleanUrl);
        } else {
            await chrome.storage.local.set({ [cleanUrl]: updated });
        }
    },

    /**
     * Get ALL stored data (for the Dashboard)
     */
    getAllData: () => {
        return new Promise((resolve) => {
            chrome.storage.local.get(null, (items) => {
                resolve(items);
            });
        });
    },

    /**
     * Update a note for an existing highlight
     */
    updateNote: async (url, highlightId, newNoteText) => {
        const cleanUrl = url.split('#')[0];
        const existing = await StorageManager.getHighlights(cleanUrl);
        
        const updated = existing.map(h => {
            if (h.id === highlightId) {
                return { ...h, note: newNoteText, updatedAt: Date.now() };
            }
            return h;
        });

        await chrome.storage.local.set({ [cleanUrl]: updated });
    }
};
