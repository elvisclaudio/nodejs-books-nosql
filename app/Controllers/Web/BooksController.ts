/// <reference path="../../../types/session.d.ts" />
import Books from '../../Models/Books';

class BooksController {

    constructor(public id: string = '') {}

    /**
     * Get all books
     */
    public static async getBooks() {
        try {
            const booksModel = new Books();
            const books = await booksModel.getBooks();
            return books;
        } catch (error) {
            console.error('Error fetching books:', error);
            return [];
        }
    }

    /**
     * Get book data by id
     */
    public static async getBookData(bookId: string) {
        try {
            const booksModel = new Books();
            const book = await booksModel.getBookById(bookId);
            return book;
        } catch (error) {
            console.error('Error fetching book data:', error);
            return null;
        }
    }

    /**
     * Save new book route 
     */
    public static async saveBook(req: any, res: any) {
        try {
            const bodyParsed = req.body;

            let title = bodyParsed?.title || bodyParsed?.book_title;
            let author_name = bodyParsed?.author_name || bodyParsed?.book_author;
            let year = bodyParsed?.year || bodyParsed?.book_year;

            let errors = [];
            if (!title) {
                errors.push('Title is required');
            }
            if (!author_name) {
                errors.push('Author name is required');
            }
            if (!year) {
                errors.push('Year is required');
            }
            
            if (errors.length > 0) {
                req.session.error = errors.join(', ');
                return res.redirect('/books/add');
            }
            
            const booksModel = new Books();
            const bookId = await booksModel.createBook({
                title,
                author_name,
                year
            });

            if (bookId) {
                req.session.success = 'Book "' + title + '" saved successfully';
                return res.redirect('/books');
            } else {
                req.session.error = 'Error saving book';
                return res.redirect('/books/add');
            }

        } catch (error) {
            console.error('Error saving book:', error);
            req.session.error = 'Error saving book';
            return res.redirect('/books/add');
        }
    }

    /**
     * Update book route by id
     */
    public static async updateBook(req: any, res: any) {
        try {
            const bookId = req.params.id;
            const bodyParsed = req.body;

            // Validate book ID
            if (!bookId) {
                req.session.error = 'Invalid book ID';
                return res.redirect('/books');
            }

            let title = bodyParsed?.title || bodyParsed?.book_title;
            let author_name = bodyParsed?.author_name || bodyParsed?.book_author;
            let year = bodyParsed?.year || bodyParsed?.book_year;

            let errors = [];
            if (!title) {
                errors.push('Title is required');
            }
            if (!author_name) {
                errors.push('Author name is required');
            }
            if (!year) {
                errors.push('Year is required');
            }
   
            if (errors.length > 0) {
                req.session.error = errors.join(', ');
                return res.redirect(`/books/${bookId}/edit`);
            }

            const booksModel = new Books();
            
            // Check if book exists
            const existingBook = await booksModel.getBookById(bookId);
            if (!existingBook) {
                req.session.error = 'Book not found';   
                return res.redirect('/books');
            }
            
            // Update book
            const success = await booksModel.updateBook(bookId, {
                title,
                author_name,
                year
            });

            if (success) {
                req.session.success = 'Book "' + title + '" updated successfully';
            } else {
                req.session.error = 'Error updating book';
            }

            return res.redirect('/books');

        } catch (error) {
            console.error('Error updating book:', error);
            req.session.error = 'Error updating book';
            return res.redirect('/books');
        }
    }

    /**
     * Delete book route by id (Web version with flash sessions and AJAX support)
     */
    public static async deleteBook(req: any, res: any) {
        try {
            const bookId = req.params.id;
            const isAjax = req.headers['content-type'] === 'application/json' || 
                          req.headers['x-requested-with'] === 'XMLHttpRequest' ||
                          req.method === 'DELETE';
            
            // if book id is missing return error
            if (!bookId) {
                if (isAjax) {
                    return res.status(400).json({
                        status: 400,
                        error: 'Invalid book ID',
                        message: 'A valid book ID is required'
                    });
                }
                req.session.error = 'Invalid book ID';
                return res.redirect('/books');
            }

            const booksModel = new Books();
            
            // Get book data for success message
            const bookData = await booksModel.getBookById(bookId);

            // if book does not exist return error
            if (!bookData) {
                if (isAjax) {
                    return res.status(404).json({
                        status: 404,
                        error: 'Book not found',
                        message: 'Book with the specified ID does not exist'
                    });
                }
                req.session.error = 'Book not found';
                return res.redirect('/books');
            }

            const bookTitle = bookData.title;

            // Delete book
            const success = await booksModel.deleteBook(bookId);
            
            if (!success) {
                if (isAjax) {
                    return res.status(500).json({
                        status: 500,
                        error: 'Failed to delete book',
                        message: 'An error occurred while deleting the book'
                    });
                }
                req.session.error = 'Failed to delete book';
                return res.redirect('/books');
            }
            
            if (isAjax) {
                return res.json({
                    status: 200,
                    data: {
                        bookId: bookId,
                    },
                    message: 'Book deleted successfully'
                });
            }
            
            req.session.success = `Book "${bookTitle}" deleted successfully`;
            return res.redirect('/books');

        } catch (error) {
            console.error('Error deleting book:', error);
            
            const isAjax = req.headers['content-type'] === 'application/json' || 
                          req.headers['x-requested-with'] === 'XMLHttpRequest' ||
                          req.method === 'DELETE';
                          
            if (isAjax) {
                return res.status(500).json({
                    status: 500,
                    error: 'Internal server error',
                    message: 'Failed to delete book'
                });
            }
            
            req.session.error = 'Failed to delete book';
            return res.redirect('/books');
        }
    }
}

export default BooksController;

