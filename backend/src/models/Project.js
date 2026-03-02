const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: 'No description provided'
    },
    techStack: [{
        type: String,
        trim: true
    }],
    projectType: {
        type: String,
        enum: ['fullstack', 'frontend', 'backend', 'mobile', 'cli', 'library', 'other'],
        default: 'other'
    },
    status: {
        type: String,
        enum: ['planning', 'in-progress', 'completed'],
        default: 'planning'
    },
    files: {
        type: Map,
        of: {
            path: String,
            content: String,
            size: Number,
            lastModified: Date
        }
    },
    totalCommits: {
        type: Number,
        default: 0
    },
    latestAiScore: {
        type: Number,
        min: 0,
        max: 100
    },
    latestCommit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Commit'
    },
    latestReview: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AIReview'
    },
    completedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for fast lookups
ProjectSchema.index({ userId: 1, name: 1 });
ProjectSchema.index({ userId: 1, status: 1 });
ProjectSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Project', ProjectSchema);
