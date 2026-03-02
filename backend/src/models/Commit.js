const mongoose = require('mongoose');

const CommitSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    hash: {
        type: String,
        required: true,
        unique: true
    },
    message: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    changes: {
        added: [String],
        modified: [String],
        deleted: [String]
    },
    snapshot: {
        type: Map,
        of: {
            path: String,
            content: String,
            size: Number,
            lastModified: Date
        }
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Index for commit history queries
CommitSchema.index({ projectId: 1, timestamp: -1 });
CommitSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Commit', CommitSchema);
