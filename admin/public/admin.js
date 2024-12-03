document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    const navItems = document.querySelectorAll('.nav-menu li');
    const pages = document.querySelectorAll('.page');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            const pageId = item.getAttribute('data-page');
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === pageId) {
                    page.classList.add('active');
                }
            });
        });
    });

    // Fetch and display stats
    async function fetchStats() {
        try {
            const response = await fetch('/api/stats');
            const data = await response.json();
            // TODO: Update UI with stats
            console.log('Stats:', data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }

    // Initial load
    fetchStats();
});
