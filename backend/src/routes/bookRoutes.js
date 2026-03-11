import express from 'express';
import {
    getBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    createBookReview,
    getExternalBooks,
    importExternalBook
} from '../controllers/bookController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getBooks).post(protect, admin, createBook);
router.route('/:id/reviews').post(protect, createBookReview);

router
    .route('/:id')
    .get(getBookById)
    .put(protect, admin, updateBook)
    .delete(protect, admin, deleteBook);

export default router;
