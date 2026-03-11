import fs from 'fs';

const file = '/Users/bandinagacharan/Documents/bookstore/backend/src/controllers/bookController.js';
let content = fs.readFileSync(file, 'utf-8');

const functionsToAdd = `



const getExternalBooks = async (req, res, next) => {
    try {
        const keyword = req.query.keyword || 'bestsellers';
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 12;
        const startIndex = (page - 1) * limit;

        const response = await fetch(\`https://www.googleapis.com/books/v1/volumes?q=\${encodeURIComponent(keyword)}&startIndex=\${startIndex}&maxResults=\${limit}\`);
        const data = await response.json();

        if (!data.items) {
           return res.json({ items: [], pagination: { total: 0, page, limit, pages: 0 } });
        }

        const formattedBooks = data.items.map(item => {
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
        
        const response = await fetch(\`https://www.googleapis.com/books/v1/volumes/\${googleId}\`);
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
`;

content = content.replace('export {', functionsToAdd + '\nexport {');
fs.writeFileSync(file, content);
console.log('Successfully injected functions.');
