import CollabRequest from '../models/collabRequestModel.js';
import { parsePagination } from '../utils/query.js';




const createCollabRequest = async (req, res, next) => {
    try {
        const {
            name,
            email,
            phone,
            organization,
            bookTitle,
            authorName,
            genre,
            publishYear,
            description,
            sampleLink,
            expectedPrice,
        } = req.body;

        if (!name || !email || !phone || !bookTitle || !authorName || !genre || !description) {
            res.status(400);
            throw new Error('Please fill all required fields');
        }

        const request = await CollabRequest.create({
            name,
            email,
            phone,
            organization,
            bookTitle,
            authorName,
            genre,
            publishYear,
            description,
            sampleLink,
            expectedPrice,
        });

        res.status(201).json({
            message: 'Request submitted successfully. Our team will contact you soon.',
            requestId: request._id,
        });
    } catch (error) {
        next(error);
    }
};




const getCollabRequests = async (req, res, next) => {
    try {
        const usePagination = req.query.paginate === 'true' || req.query.page || req.query.limit;
        const status = req.query.status ? { status: req.query.status } : {};

        if (usePagination) {
            const { page, limit, skip } = parsePagination(req.query);
            const [total, requests] = await Promise.all([
                CollabRequest.countDocuments(status),
                CollabRequest.find(status).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            ]);

            res.json({
                items: requests,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            });
            return;
        }

        const requests = await CollabRequest.find(status).sort({ createdAt: -1 }).lean();
        res.json(requests);
    } catch (error) {
        next(error);
    }
};




const updateCollabRequest = async (req, res, next) => {
    try {
        const request = await CollabRequest.findById(req.params.id);

        if (!request) {
            res.status(404);
            throw new Error('Collaboration request not found');
        }

        const { status, notes } = req.body;
        if (status) request.status = status;
        if (notes !== undefined) request.notes = notes;

        const updated = await request.save();
        res.json(updated);
    } catch (error) {
        next(error);
    }
};

export { createCollabRequest, getCollabRequests, updateCollabRequest };
