import mongoose from 'mongoose';

const collabRequestSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        organization: { type: String, default: '' },
        bookTitle: { type: String, required: true },
        authorName: { type: String, required: true },
        genre: { type: String, required: true },
        publishYear: { type: Number, default: null },
        description: { type: String, required: true },
        sampleLink: { type: String, default: '' },
        expectedPrice: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ['new', 'contacted', 'approved', 'rejected'],
            default: 'new',
        },
        notes: { type: String, default: '' },
    },
    { timestamps: true }
);

collabRequestSchema.index({ status: 1, createdAt: -1 });
collabRequestSchema.index({ email: 1, createdAt: -1 });

const CollabRequest = mongoose.model('CollabRequest', collabRequestSchema);
export default CollabRequest;
