import dbConnection from '../DB/db-connection';

interface Book {
    id?: string;
    title: string;
    author_name: string;
    year: string;
}

export default class Books {

    public async getBooks(): Promise<Book[]> {
        try {
            const db = dbConnection();
            const snapshot = await db.collection('books').get();
            
            const books: Book[] = [];
            snapshot.forEach((doc) => {
                const book = doc.data() as Book;
                book.id = doc.id;
                books.push(book);
            });

            return books;
        } catch (error) {
            console.error('Error fetching books:', error);
            return [];
        }
    }

    public async getBookById(bookId: string): Promise<Book | null> {
        try {
            const db = dbConnection();

            //select * from books where id = bookId -- equivalent in sql
            const doc = await db.collection('books').doc(bookId).get();
            
            if (!doc.exists) {
                return null;
            }

            const book = doc.data() as any;
            book.id = doc.id;
            return book;

        } catch (error) {
            console.error('Error fetching book:', error);
            return null;
        }
    }

    public async createBook(bookData: Omit<Book, 'id'>): Promise<string | null> {
        try {
            const db = dbConnection();

            //insert into books (title, author_name, year) values (bookData.title, bookData.author_name, bookData.year) -- equivalent in sql
            const docRef = await db.collection('books').add(bookData);
            return docRef.id;
        } catch (error) {
            console.error('Error creating book:', error);
            return null;
        }
    }

    public async updateBook(bookId: string, bookData: Partial<Book>): Promise<boolean> {
        try {
            const db = dbConnection();
            //update books set title = bookData.title, author_name = bookData.author_name, year = bookData.year where id = bookId -- equivalent in sql
            await db.collection('books').doc(bookId).update(bookData);
            return true;
        } catch (error) {
            console.error('Error updating book:', error);
            return false;
        }
    }

    public async deleteBook(bookId: string): Promise<boolean> {
        try {
            const db = dbConnection();
            //delete from books where id = bookId -- equivalent in sql
            await db.collection('books').doc(bookId).delete();
            return true;
        } catch (error) {
            console.error('Error deleting book:', error);
            return false;
        }
    }
}

