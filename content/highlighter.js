
/**
 * Highlighter Core Logic
 * Handles the "math" of converting a DOM Selection into a JSON object 
 * and converting that JSON object back into a DOM Range.
 */
const Highlighter = {

    /**
     * 1. GET SELECTION DATA
     * Captures the current user selection and returns a storable object.
     * Returns null if selection is invalid.
     */
    captureSelection: () => {
        const selection = window.getSelection();
        
        // Basic validation
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
            return null;
        }

        const range = selection.getRangeAt(0);
        
        // We need to store the path to the start container and end container
        const startPath = Highlighter.getXPath(range.startContainer);
        const endPath = Highlighter.getXPath(range.endContainer);

        const payload = {
            text: selection.toString(),
            startXPath: startPath,
            startOffset: range.startOffset,
            endXPath: endPath,
            endOffset: range.endOffset,
            // We store the full URL to ensure we match the right page later
            pageUrl: window.location.href
        };

        return payload;
    },

    /**
     * 2. RESTORE HIGHLIGHTS
     * Takes the stored JSON data and paints the highlight on the screen.
     */
    drawHighlight: (highlightId, color, rangeData) => {
            try {
                const range = document.createRange();
                const startNode = Highlighter.getNodeByXPath(rangeData.startXPath);
                const endNode = Highlighter.getNodeByXPath(rangeData.endXPath);

                if (!startNode || !endNode) return false;

                range.setStart(startNode, rangeData.startOffset);
                range.setEnd(endNode, rangeData.endOffset);

                const mark = document.createElement('mark');
                mark.className = 'lumina-highlight';
                mark.dataset.id = highlightId;
                mark.style.backgroundColor = color;
                mark.style.color = 'inherit'; 
                mark.style.cursor = 'pointer';

                // --- NEW: Add Note Metadata to DOM ---
                if (rangeData.note) {
                    mark.dataset.hasNote = "true";
                    mark.dataset.note = rangeData.note; // Store note for easy retrieval
                }
                // -------------------------------------

                const fragment = range.extractContents();
                mark.appendChild(fragment);
                range.insertNode(mark);

                return true;

            } catch (e) {
                console.error("Lumina: Error drawing highlight", e);
                return false;
            }
      },

    /**
     * UTILITY: Generate XPath for a node
     * Creates a string like: /HTML/BODY/DIV[2]/P[1]/TEXT()[3]
     */
    getXPath: (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            // If it's a text node, we need to know WHICH text node sibling it is
            let siblingIndex = 1;
            let sibling = node.previousSibling;
            while (sibling) {
                if (sibling.nodeType === Node.TEXT_NODE) siblingIndex++;
                sibling = sibling.previousSibling;
            }
            // Recurse up to the parent element
            return `${Highlighter.getXPath(node.parentNode)}/text()[${siblingIndex}]`;
        }

        if (node.id) {
            return `//*[@id="${node.id}"]`;
        }

        if (node === document.body) return '/html/body';

        let siblingIndex = 1;
        let sibling = node.previousElementSibling;
        while (sibling) {
            if (sibling.tagName === node.tagName) siblingIndex++;
            sibling = sibling.previousElementSibling;
        }

        return `${Highlighter.getXPath(node.parentNode)}/${node.tagName.toLowerCase()}[${siblingIndex}]`;
    },

    /**
     * UTILITY: Find a node by XPath
     */
    getNodeByXPath: (path) => {
        return document.evaluate(
            path, 
            document, 
            null, 
            XPathResult.FIRST_ORDERED_NODE_TYPE, 
            null
        ).singleNodeValue;
    }
};
