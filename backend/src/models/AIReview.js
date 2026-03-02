const mongoose = require('mongoose');

const AIReviewSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true
    },
    commitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Commit',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    overallScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    sections: {
        codeHealth: {
            score: {
                type: Number,
                required: true,
                min: 0,
                max: 100
            },
            issues: [{
                severity: {
                    type: String,
                    enum: ['critical', 'warning', 'info']
                },
                title: String,
                description: String,
                file: String,
                snippet: String
            }],
            summary: String
        },
        architecture: {
            score: {
                type: Number,
                required: true,
                min: 0,
                max: 100
            },
            issues: [{
                severity: {
                    type: String,
                    enum: ['critical', 'warning', 'info']
                },
                title: String,
                description: String,
                file: String,
                snippet: String
            }],
            summary: String
        },
        security: {
            score: {
                type: Number,
                required: true,
                min: 0,
                max: 100
            },
            issues: [{
                severity: {
                    type: String,
                    enum: ['critical', 'warning', 'info']
                },
                title: String,
                description: String,
                file: String,
                snippet: String
            }],
            summary: String
        },
        scalability: {
            score: {
                type: Number,
                required: true,
                min: 0,
                max: 100
            },
            issues: [{
                severity: {
                    type: String,
                    enum: ['critical', 'warning', 'info']
                },
                title: String,
                description: String,
                file: String,
                snippet: String
            }],
            summary: String
        }
    },
    verdict: {
        level: {
            type: String,
            required: true
        },
        justification: {
            type: String,
            required: true
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

// Index for review history queries
AIReviewSchema.index({ projectId: 1, timestamp: -1 });
AIReviewSchema.index({ userId: 1, timestamp: -1 });
AIReviewSchema.index({ overallScore: -1 });

module.exports = mongoose.model('AIReview', AIReviewSchema);
