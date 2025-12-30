/**
 * Dashboard Application Logic
 * Manages the display and interaction of the notes dashboard.
 */
const Dashboard = {
    // State to hold all loaded data
    data: {}, 
    // State to track currently filtered/displayed data
    filteredData: {},
    activeDomain: null, // Which domain is currently clicked in sidebar

    /**
     * Start the application
     */
    init: async () => {
        await Dashboard.loadData();
        Dashboard.attachListeners();
        
        // Auto-select the first domain if exists
        const domains = Object.keys(Dashboard.filteredData);
        if (domains.length > 0) {
            Dashboard.selectDomain(domains[0]);
        } else {
            Dashboard.renderEmptyState();
        }
    },

    /**
     * Load data from Chrome Storage and group it by Domain
     */
    loadData: async () => {
        const rawData = await StorageManager.getAllData();
        
        // Transformation: Group by Domain
        // Result: { "example.com": [ {url:..., highlights:[]}, ... ], ... }
        const grouped = {};

        for (const [url, highlights] of Object.entries(rawData)) {
            if (!highlights || highlights.length === 0) continue;

            try {
                const domain = new URL(url).hostname;
                if (!grouped[domain]) grouped[domain] = [];
                
                grouped[domain].push({
                    url: url,
                    highlights: highlights
                });
            } catch (e) {
                console.warn("Invalid URL found:", url);
            }
        }

        Dashboard.data = grouped;
        Dashboard.filteredData = grouped; // Initially, filtered is same as raw
        Dashboard.renderSidebar();
    },

    /**
     * Render the list of websites in the Sidebar
     */
    renderSidebar: () => {
        const list = document.getElementById('domain-list');
        list.innerHTML = '';

        const domains = Object.keys(Dashboard.filteredData).sort();

        domains.forEach(domain => {
            const li = document.createElement('li');
            li.className = 'domain-item';
            // Simple favicon using Google's service (reliable for extensions)
            li.innerHTML = `
                <img src="https://www.google.com/s2/favicons?domain=${domain}&sz=16" />
                <span>${domain}</span>
            `;
            
            // Highlight active selection
            if (domain === Dashboard.activeDomain) li.classList.add('active');

            li.addEventListener('click', () => Dashboard.selectDomain(domain));
            list.appendChild(li);
        });
    },

    /**
     * Handle user clicking a domain in sidebar
     */
    selectDomain: (domain) => {
        Dashboard.activeDomain = domain;
        Dashboard.renderSidebar(); // Re-render to update 'active' class
        Dashboard.renderHighlights(domain);
    },

    /**
     * Render the cards in the main area
     */
    renderHighlights: (domain) => {
        const container = document.getElementById('highlights-list');
        const title = document.getElementById('page-title');
        const stats = document.getElementById('stats-display');
        
        container.innerHTML = '';
        
        if (!domain || !Dashboard.filteredData[domain]) {
            Dashboard.renderEmptyState();
            return;
        }

        const pages = Dashboard.filteredData[domain];
        title.textContent = domain;
        
        let totalNotes = 0;

        // Loop through every page under this domain
        pages.forEach(page => {
            // Create a small header for the specific page URL
            const pageHeader = document.createElement('h3');
            pageHeader.style.fontSize = '14px';
            pageHeader.style.color = '#94a3b8';
            pageHeader.style.marginTop = '20px';
            pageHeader.style.marginBottom = '10px';
            pageHeader.innerHTML = `<a href="${page.url}" target="_blank" style="text-decoration:none; color:inherit;">📄 ${page.url}</a>`;
            container.appendChild(pageHeader);

            // Loop through highlights on this page
            page.highlights.forEach(h => {
                totalNotes++;
                const card = Dashboard.createCard(h, page.url);
                container.appendChild(card);
            });
        });

        stats.textContent = `${totalNotes} notes found`;
    },

    /**
     * HTML Generator for a single Highlight Card
     */
    createCard: (h, url) => {
        const card = document.createElement('div');
        card.className = 'note-card';
        // Set CSS variable for the colored sidebar
        card.style.setProperty('--card-color', h.color || '#ffeb3b');

        const dateStr = new Date(h.createdAt).toLocaleDateString();

        card.innerHTML = `
            <div class="note-context">"${h.text}"</div>
            ${h.note ? `<div class="note-text">📝 ${h.note}</div>` : ''}
            
            <div class="card-footer">
                <span>${dateStr}</span>
                <button class="delete-btn" title="Delete Note">
                    ${Icons.trash || 'Delete'} 
                </button>
            </div>
        `;

        // Delete Logic
        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', async (e) => {
            if(confirm("Delete this highlight?")) {
                await StorageManager.removeHighlight(url, h.id);
                // Reload data to reflect changes
                await Dashboard.loadData(); 
                // Restore view
                if(Dashboard.data[Dashboard.activeDomain]) {
                    Dashboard.renderHighlights(Dashboard.activeDomain);
                } else {
                    // If we deleted the last item in a domain, select first available
                    Dashboard.init();
                }
            }
        });

        return card;
    },

    renderEmptyState: () => {
        document.getElementById('highlights-list').innerHTML = `
            <div class="empty-state">
                <p>No highlights found.</p>
                <small>Go to a website, select text, and click a color!</small>
            </div>
        `;
    },

    /**
     * Search / Filtering Logic
     */
    attachListeners: () => {
        const searchInput = document.getElementById('search-input');
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            
            if (!query) {
                Dashboard.filteredData = Dashboard.data;
            } else {
                // Deep filter: Filter Domains -> Pages -> Highlights
                const newFiltered = {};
                
                Object.keys(Dashboard.data).forEach(domain => {
                    const pages = Dashboard.data[domain];
                    const matchingPages = [];

                    pages.forEach(page => {
                        // Check if URL matches
                        const urlMatch = page.url.toLowerCase().includes(query);
                        
                        // Check if any highlight text or note matches
                        const matchingHighlights = page.highlights.filter(h => 
                            h.text.toLowerCase().includes(query) || 
                            (h.note && h.note.toLowerCase().includes(query))
                        );

                        if (urlMatch || matchingHighlights.length > 0) {
                            // Keep the page, but maybe only show matching highlights?
                            // For simplicity, if page matches, show all. If only note matches, show specific.
                            matchingPages.push({
                                url: page.url,
                                highlights: matchingHighlights.length > 0 ? matchingHighlights : page.highlights
                            });
                        }
                    });

                    if (matchingPages.length > 0) {
                        newFiltered[domain] = matchingPages;
                    }
                });

                Dashboard.filteredData = newFiltered;
            }

            Dashboard.renderSidebar();
            // Automatically select first result
            const firstDomain = Object.keys(Dashboard.filteredData)[0];
            Dashboard.selectDomain(firstDomain);
        });
    }
};

// Boot
document.addEventListener('DOMContentLoaded', Dashboard.init);
