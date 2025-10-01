/// <reference path="./types/session.d.ts" />
import express from 'express';
import BooksController from './app/Controllers/Web/BooksController';
import ApiBooksController from './app/Controllers/Api/ApiBooksController';
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';
import nunjucks from 'nunjucks';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || 'localhost';

/* Set up Nunjucks as the view engine (Jinja2 equivalent for Node.js) */
nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch: true
});

app.set('view engine', 'njk');
app.set('views', './views');

/* Set up static files PUBLIC directory (images, css, js) */
app.use(express.static(path.join(__dirname, 'public')));

/* Session configuration */
app.use(session({
    secret: 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

/* Middleware to parse JSON request bodies */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* Middleware to make session available in templates */
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

/* Set CORS for all routes */
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    next();
});

/* ==================== HTML ROUTES (Web Interface) ==================== */

// Home Page - Display all books
app.get(['/', '/books'], async function(req, res) {
    try {
        const books = await BooksController.getBooks();
        
        // Get flash messages
        const success = req.session.success;
        const error = req.session.error;
        delete req.session.success;
        delete req.session.error;
        
        res.render('index.njk', {
            title: 'Home - Books',
            books: books,
            success: success,
            error: error
        });
    } catch (error) {
        console.error('Error getting books:', error);
        res.render('index.njk', {
            title: 'Home - Books',
            books: [],
            error: 'Error getting books'
        });
    }
});

// Add Book Form
app.get('/books/add', (req, res) => {
    const success = req.session.success;
    const error = req.session.error;
    delete req.session.success;
    delete req.session.error;

    res.render('add.njk', {
        title: 'Add Book',
        success: success,
        error: error,
    });
});

// View Single Book
app.get('/books/:id', async function(req, res) {
    try {
        const bookId = req.params.id;
        const book = await BooksController.getBookData(bookId);

        if (!book) {
            req.session.error = 'Book not found';
            return res.redirect('/books');
        }

        const success = req.session.success;
        const error = req.session.error;
        delete req.session.success;
        delete req.session.error;
        
        res.render('book-detail.njk', {
            title: `${book.title} - Book Details`,
            book: book,
            success: success,
            error: error
        });
    } catch (error) {
        console.error('Error fetching book:', error);
        req.session.error = 'Error loading book details';
        res.redirect('/books');
    }
});

// Edit Book Form
app.get('/books/:id/edit', async function(req, res) {
    try {
        const bookId = req.params.id;
        const book = await BooksController.getBookData(bookId);

        if (!book) {
            req.session.error = 'Book not found';
            return res.redirect('/books');
        }

        const success = req.session.success;
        const error = req.session.error;
        delete req.session.success;
        delete req.session.error;

        res.render('edit.njk', {
            title: 'Edit Book',
            book: book,
            success: success,
            error: error
        });
    } catch (error) {
        console.error('Error fetching book for edit:', error);
        req.session.error = 'Error loading book for editing';
        res.redirect('/books');
    }
});

// Save New Book
app.post('/books/save-book', BooksController.saveBook);

// Update Book
app.post('/books/:id', BooksController.updateBook);

// Delete Book (supports both HTML and AJAX)
app.delete('/books/:id', BooksController.deleteBook);

/* ==================== END HTML ROUTES ==================== */


/* ==================== JSON API ROUTES ==================== */

app.get('/api/books', ApiBooksController.getBooks); // GET - Fetch all books (JSON)
app.get('/api/books/:id', ApiBooksController.getBookById); // GET - Fetch single book (JSON)
app.post('/api/books/save', ApiBooksController.saveBook); // POST - Create new book (JSON)
app.post('/api/books/:id', ApiBooksController.updateBook); // POST/PUT - Update book (JSON)
app.delete('/api/books/:id', ApiBooksController.deleteBook); // DELETE - Delete book (JSON)

/* ==================== END JSON API ROUTES ==================== */


/* ==================== 404 ERROR HANDLER ==================== */

app.use((req: any, res: any) => {
    // Check if the request contains api in the path
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            status: 404,
            error: 'API endpoint not found',
            message: 'The requested API endpoint does not exist'
        });
    }

    // For HTML requests - render error page or simple message
    return res.status(404).send(`
        <html>
            <head><title>Page Not Found</title></head>
            <body>
                <h1>404 - Page Not Found</h1>
                <p>The page you are looking for does not exist.</p>
                <p>Path: ${req.path}</p>
                <a href="/books">Go to Home</a>
            </body>
        </html>
    `);
});

/* ==================== END 404 ERROR HANDLER ==================== */


/* START SERVER */
app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
