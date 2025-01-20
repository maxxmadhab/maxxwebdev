const express = require('express');
const path = require('path');
const fs = require('fs');

// Create an Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Get the absolute path of your project directory
const PROJECT_ROOT = __dirname;

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(PROJECT_ROOT, 'views'));

// Serve static files from multiple directories
app.use('/css', express.static(path.join(PROJECT_ROOT, 'css')));
app.use('/js', express.static(path.join(PROJECT_ROOT, 'js')));
app.use('/images', express.static(path.join(PROJECT_ROOT, 'images')));
app.use('/data', express.static(path.join(PROJECT_ROOT, 'data')));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global context function for rendering pages
function renderPage(res, page, additionalContext = {}) {
    // Default global context
    const globalContext = {
        appName: 'StudySync',
        page: page,
        ...additionalContext
    };

    // Try to find HTML file first
    const htmlFilePath = path.join(PROJECT_ROOT, `${page}.html`);
    
    if (fs.existsSync(htmlFilePath)) {
        return res.sendFile(htmlFilePath);
    }

    // If no HTML file, try to render EJS template
    try {
        res.render(page, globalContext);
    } catch (error) {
        console.error(`Error rendering page ${page}:`, error);
        res.status(404).render('404', globalContext);
    }
}

// Home route
app.get('/', (req, res) => {
    renderPage(res, 'index');
});

// Dynamic route for pages
app.get('/:page', (req, res) => {
    const page = req.params.page;
    
    // List of allowed pages to prevent directory traversal
    const allowedPages = [
        'index', 'home', 'studysync', 
        'reviewpage', 'price', 
        'login', 'login2'
    ];

    // Sanitize page name
    const sanitizedPage = page.replace(/[^a-zA-Z0-9-_]/g, '');

    if (allowedPages.includes(sanitizedPage)) {
        renderPage(res, sanitizedPage);
    } else {
        res.status(404).render('404', { 
            appName: 'StudySync', 
            page: '404' 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).render('500', { 
        appName: 'StudySync', 
        page: 'error',
        errorMessage: err.message 
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Project Root:', PROJECT_ROOT);
    console.log('Static file directories:');
    console.log('- /css     → CSS folder');
    console.log('- /js      → JavaScript folder');
    console.log('- /images  → Images folder');
    console.log('- /data    → JSON data folder');
});