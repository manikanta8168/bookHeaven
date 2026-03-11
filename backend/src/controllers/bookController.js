import Book from '../models/bookModel.js';
import { parsePagination } from '../utils/query.js';




const getBooks = async (req, res, next) => {
    try {
        const usePagination = req.query.paginate === 'true' || req.query.page || req.query.limit;
        const keyword = req.query.keyword
            ? {
                title: {
                    $regex: req.query.keyword,
                    $options: 'i',
                },
            }
            : {};

        const category = req.query.category ? { category: req.query.category } : {};

        const filter = { ...keyword, ...category };

        if (usePagination) {
            const { page, limit, skip } = parsePagination(req.query);
            const [total, books] = await Promise.all([
                Book.countDocuments(filter),
                Book.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            ]);

            res.json({
                items: books,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            });
            return;
        }

        const books = await Book.find(filter).sort({ createdAt: -1 }).lean();
        res.json(books);
    } catch (error) {
        next(error);
    }
};




const getBookById = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id).lean();

        if (book) {
            res.json(book);
        } else {
            res.status(404);
            throw new Error('Book not found');
        }
    } catch (error) {
        next(error);
    }
};




const createBook = async (req, res, next) => {
    try {
        const {
            title,
            author,
            price,
            description,
            image,
            category,
            countInStock,
        } = req.body;

        const book = new Book({
            title: title || 'Sample Book',
            author: author || 'Sample Author',
            price: price ?? 0,
            user: req.user._id,
            image: image || '/images/sample.jpg',
            category: category || 'Sample Category',
            countInStock: countInStock ?? 0,
            numReviews: 0,
            description: description || 'Sample description',
        });

        const createdBook = await book.save();
        res.status(201).json(createdBook);
    } catch (error) {
        next(error);
    }
};




const updateBook = async (req, res, next) => {
    try {
        const { title, author, price, description, image, category, countInStock } =
            req.body;

        const book = await Book.findById(req.params.id);

        if (book) {
            book.title = title;
            book.author = author;
            book.price = price;
            book.description = description;
            book.image = image;
            book.category = category;
            book.countInStock = countInStock;

            const updatedBook = await book.save();
            res.json(updatedBook);
        } else {
            res.status(404);
            throw new Error('Book not found');
        }
    } catch (error) {
        next(error);
    }
};




const deleteBook = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id);

        if (book) {
            await book.deleteOne();
            res.json({ message: 'Book removed' });
        } else {
            res.status(404);
            throw new Error('Book not found');
        }
    } catch (error) {
        next(error);
    }
};




const createBookReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;

        const book = await Book.findById(req.params.id);

        if (book) {
            const alreadyReviewed = book.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );

            if (alreadyReviewed) {
                res.status(400);
                throw new Error('Book already reviewed');
            }

            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user._id,
            };

            book.reviews.push(review);
            book.numReviews = book.reviews.length;
            book.rating =
                book.reviews.reduce((acc, item) => item.rating + acc, 0) /
                book.reviews.length;

            await book.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404);
            throw new Error('Book not found');
        }
    } catch (error) {
        next(error);
    }
};





const getExternalBooks = async (req, res, next) => {
    try {
        let qParam = req.query.keyword ? encodeURIComponent(req.query.keyword) : '';
        if (req.query.category && req.query.category !== 'All') {
            const subjectStr = `subject:${encodeURIComponent(req.query.category)}`;
            qParam += qParam ? `+${subjectStr}` : subjectStr;
        }
        if (!qParam) {
            const popularQueries = ['harry potter', 'lord of the rings', 'the hobbit', 'dune', 'stephen king', 'agatha christie', 'percy jackson', 'hunger games', 'the da vinci code'];
            qParam = encodeURIComponent(popularQueries[Math.floor(Math.random() * popularQueries.length)]);
        }

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 40;
        const startIndex = (page - 1) * limit;

        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${qParam}&startIndex=${startIndex}&maxResults=${limit}&printType=books&langRestrict=en&orderBy=relevance`);
        const data = await response.json();

        if (!data.items) {
           return res.json({ items: [], pagination: { total: 0, page, limit, pages: 0 } });
        }

        const seenTitles = new Set();
        const uniqueItems = [];

        for (const item of data.items) {
            const vol = item.volumeInfo;
            const title = vol.title || 'Unknown Title';
            if (!seenTitles.has(title)) {
                seenTitles.add(title);
                uniqueItems.push(item);
            }
        }

        const formattedBooks = uniqueItems.map(item => {
            const vol = item.volumeInfo;
            
            return {
                _id: item.id, 
                title: vol.title || 'Unknown Title',
                author: vol.authors ? vol.authors.join(', ') : 'Unknown Author',
                image: vol.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop',
                description: vol.description || 'No description available.',
                category: vol.categories ? vol.categories[0] : 'General',
                price: vol.pageCount ? Math.min(500, Math.max(300, vol.pageCount)) : 399,
                countInStock: Math.floor(Math.random() * 20) + 5,
                rating: vol.averageRating || 0,
                numReviews: vol.ratingsCount || 0,
                isExternal: true 
            };
        });

        res.json({
            items: formattedBooks,
            pagination: {
                total: data.totalItems || 0,
                page,
                limit,
                pages: Math.ceil((data.totalItems || 0) / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};




const importExternalBook = async (req, res, next) => {
    try {
        const { googleId } = req.params;
        
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${googleId}`);
        const data = await response.json();
        
        if (!data || !data.volumeInfo) {
             res.status(404);
             throw new Error('Google Book not found');
        }
        
        const vol = data.volumeInfo;
        const title = vol.title || 'Unknown Title';
        
        const existingBook = await Book.findOne({ title });
        if (existingBook) {
            return res.json(existingBook);
        }

        const adminUser = await import('../models/userModel.js').then(m => m.default)
            .then(User => User.findOne({ isAdmin: true }));

        const book = new Book({
            user: adminUser._id, 
            title: title,
            author: vol.authors ? vol.authors.join(', ') : 'Unknown Author',
            image: vol.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop',
            description: vol.description || 'No description available.',
            category: vol.categories ? vol.categories[0] : 'General',
            price: vol.pageCount ? Math.min(500, Math.max(300, vol.pageCount)) : 399,
            countInStock: 50,
            rating: vol.averageRating || 0,
            numReviews: vol.ratingsCount || 0,
        });

        const savedBook = await book.save();
        res.status(201).json(savedBook);
        
    } catch (error) {
        next(error);
    }
};

export {
    getBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    createBookReview,
    getExternalBooks,
    importExternalBook
};
