import Books from '../../Models/Books';

class ApiBooksController {
 
    constructor(public id: string = '') {}

    /**
     * Get all books and return as JSON
     */
    public static async getBooks(req: any, res: any) {
        try {
            const booksModel = new Books();
            const books = await booksModel.getBooks();

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-cache');
            res.status(200);

            res.json({
                status: 200,
                data: {
                    books: books,
                    total: books.length
                },
                message: 'Books fetched successfully'
            });

        } catch (error) {
            console.error('Error fetching books:', error);
            res.status(500).json({ 
                status: 500,
                error: 'Failed to fetch books' 
            });
        }
    }

    /**
     * Get single book by id and return as JSON
     */
    public static async getBookById(req: any, res: any) {
        try {
            const bookId = req.params.id;

            if (!bookId) {
                return res.status(400).json({
                    status: 400,
                    error: 'Invalid book ID',
                    message: 'A valid book ID is required'
                });
            }

            const booksModel = new Books();
            const book = await booksModel.getBookById(bookId);

            // Data not found return 404
            if (!book) {
                return res.status(404).json({
                    status: 404,
                    data: {
                        book: null
                    },
                    message: 'Book not found'
                });
            }

            return res.json({
                status: 200,
                data: {
                    bookId: bookId,
                    book: book
                },
                message: 'Book fetched successfully'
            });

        } catch (error) {
            console.error('Error fetching book:', error);
            return res.status(500).json({
                status: 500,
                error: 'Internal server error',
                message: 'Failed to fetch book'
            });
        }
    }

    /**
     * Create new book and return JSON response
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
                return res.status(400).json({
                    status: 400,
                    error: 'Missing required fields',
                    message: errors.join(', ')
                });
            }
            
            const booksModel = new Books();
            const bookId = await booksModel.createBook({
                title,
                author_name,
                year
            });

            if (!bookId) {
                return res.status(500).json({
                    status: 500,
                    error: 'Failed to save book',
                    message: 'An error occurred while saving the book'
                });
            }
            
            // Return success response with the created book
            return res.status(201).json({
                status: 201,
                data: {
                    book_id: bookId
                },
                message: 'Book saved successfully'
            });

        } catch (error) {
            console.error('Error saving book:', error);
            return res.status(500).json({
                status: 500,
                error: 'Internal server error',
                message: 'Failed to save book'
            });
        }
    }

    /**
     * Update book by id and return JSON response
     */
    public static async updateBook(req: any, res: any) {
        try {
            const bookId = req.params.id;
            const bodyParsed = req.body;

            // Validate book ID
            if (!bookId) {
                return res.status(400).json({
                    status: 400,
                    error: 'Invalid book ID',
                    message: 'A valid book ID is required'
                });
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
                return res.status(400).json({
                    status: 400,
                    error: 'Missing required fields',
                    message: errors.join(', ')
                });
            }

            const booksModel = new Books();
            
            // Check if book exists
            const existingBook = await booksModel.getBookById(bookId);
            if (!existingBook) {
                return res.status(404).json({
                    status: 404,
                    error: 'Book not found',
                    message: 'Book with the specified ID does not exist'
                });
            }
            
            // Update book
            const success = await booksModel.updateBook(bookId, {
                title,
                author_name,
                year
            });

            if (!success) {
                return res.status(500).json({
                    status: 500,
                    error: 'Failed to update book',
                    message: 'An error occurred while updating the book'
                });
            }
            
            return res.status(200).json({
                status: 200,
                data: {
                    bookId: bookId,
                },
                message: 'Book updated successfully'
            });

        } catch (error) {
            console.error('Error updating book:', error);
            return res.status(500).json({
                status: 500,
                error: 'Internal server error',
                message: 'Failed to update book'
            });
        }
    }

    /**
     * Delete book by id and return JSON response
     */
    public static async deleteBook(req: any, res: any) {
        try {
            const bookId = req.params.id;
            
            // if book id is missing return error
            if (!bookId) {
                return res.status(400).json({
                    status: 400,
                    error: 'Invalid book ID',
                    message: 'A valid book ID is required'
                });
            }

            const booksModel = new Books();
            
            // Check if book exists
            const existingBook = await booksModel.getBookById(bookId);
            if (!existingBook) {
                return res.status(404).json({
                    status: 404,
                    error: 'Book not found',
                    message: 'Book with the specified ID does not exist'
                });
            }

            // Delete book
            const success = await booksModel.deleteBook(bookId);
            
            if (!success) {
                return res.status(500).json({
                    status: 500,
                    error: 'Failed to delete book',
                    message: 'An error occurred while deleting the book'
                });
            }
            
            return res.status(200).json({
                status: 200,
                data: {
                    bookId: bookId,
                },
                message: 'Book deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting book:', error);
            return res.status(500).json({
                status: 500,
                error: 'Internal server error',
                message: 'Failed to delete book'
            });
        }
    }
}

export default ApiBooksController;

