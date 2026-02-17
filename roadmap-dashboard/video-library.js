/**
 * VIDEO LIBRARY MODULE
 * Professional video learning platform with progress tracking and notes
 */

(function() {
    'use strict';

    // ==================== STATE ====================
    const state = {
        videos: [],
        currentVideo: null,
        watchProgress: {}, // { videoId: { progress: 0-100, status: 'not-started|in-progress|completed', watchedSeconds: 0 } }
        currentView: 'grid', // 'grid' | 'watch'
        videoPlayer: null
    };

    // ==================== MOCK DATA ====================
    const MOCK_VIDEOS = [
        {
            id: 'v1',
            title: 'Introduction to Data Structures',
            description: 'Learn the fundamentals of data structures including arrays, linked lists, stacks, and queues. Perfect for beginners starting their journey in computer science.',
            duration: 900, // seconds
            category: 'beginner',
            tags: ['data structures', 'programming', 'fundamentals'],
            thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180"%3E%3Crect fill="%231a1a1a" width="320" height="180"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23666" font-size="20" dy=".3em"%3EData Structures%3C/text%3E%3C/svg%3E',
            videoUrl: 'https://www.youtube.com/embed/RBSGKlAvoiM',
            subject: 'Programming'
        },
        {
            id: 'v2',
            title: 'Advanced Algorithm Design',
            description: 'Master advanced algorithmic techniques including dynamic programming, greedy algorithms, and graph algorithms. Essential for technical interviews.',
            duration: 1200,
            category: 'advanced',
            tags: ['algorithms', 'dynamic programming', 'graphs'],
            thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180"%3E%3Crect fill="%231a1a1a" width="320" height="180"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23666" font-size="20" dy=".3em"%3EAlgorithms%3C/text%3E%3C/svg%3E',
            videoUrl: 'https://www.youtube.com/embed/oBt53YbR9Kk',
            subject: 'Programming'
        },
        {
            id: 'v3',
            title: 'System Design Fundamentals',
            description: 'Understand how to design scalable distributed systems. Learn about load balancing, caching, databases, and microservices architecture.',
            duration: 1500,
            category: 'intermediate',
            tags: ['system design', 'architecture', 'scalability'],
            thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180"%3E%3Crect fill="%231a1a1a" width="320" height="180"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23666" font-size="20" dy=".3em"%3ESystem Design%3C/text%3E%3C/svg%3E',
            videoUrl: 'https://www.youtube.com/embed/UzLMhqg3_Wc',
            subject: 'System Design'
        },
        {
            id: 'v4',
            title: 'Aptitude: Time & Work Problems',
            description: 'Master time and work problems commonly asked in aptitude tests. Learn shortcut techniques and problem-solving strategies.',
            duration: 600,
            category: 'beginner',
            tags: ['aptitude', 'quantitative', 'time and work'],
            thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180"%3E%3Crect fill="%231a1a1a" width="320" height="180"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23666" font-size="20" dy=".3em"%3EAptitude%3C/text%3E%3C/svg%3E',
            videoUrl: 'https://www.youtube.com/embed/example4',
            subject: 'Aptitude'
        },
        {
            id: 'v5',
            title: 'Effective Communication Skills',
            description: 'Develop professional communication skills essential for workplace success. Learn verbal and written communication techniques.',
            duration: 750,
            category: 'intermediate',
            tags: ['soft skills', 'communication', 'professional development'],
            thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180"%3E%3Crect fill="%231a1a1a" width="320" height="180"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23666" font-size="20" dy=".3em"%3ECommunication%3C/text%3E%3C/svg%3E',
            videoUrl: 'https://www.youtube.com/embed/example5',
            subject: 'Soft Skills'
        },
        {
            id: 'v6',
            title: 'Database Theory: ACID Properties',
            description: 'Deep dive into database theory covering ACID properties, normalization, and transaction management. Essential for backend developers.',
            duration: 1000,
            category: 'intermediate',
            tags: ['database', 'theory', 'ACID', 'transactions'],
            thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180"%3E%3Crect fill="%231a1a1a" width="320" height="180"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23666" font-size="20" dy=".3em"%3EDatabase Theory%3C/text%3E%3C/svg%3E',
            videoUrl: 'https://www.youtube.com/embed/example6',
            subject: 'Theory'
        }
    ];

    // ==================== DOM REFERENCES ====================
    const dom = {
        videoGrid: null,
        videoGridView: null,
        videoWatchView: null,
        uploadBtn: null,
        backToVideosBtn: null,
        playerContainer: null,
        downloadNotesBtn: null
    };

    // ==================== INITIALIZATION ====================
    function init() {
        console.log('[VideoLibrary] Initializing...');
        
        cacheDOMElements();
        loadState();
        setupEventListeners();
        
        // Load mock videos
        state.videos = MOCK_VIDEOS;
        
        // Initial render if on video library page
        const videoLibraryPage = document.getElementById('video-library-page');
        if (videoLibraryPage && !videoLibraryPage.classList.contains('hidden')) {
            renderVideoGrid();
        }
        
        console.log('[VideoLibrary] Ready');
    }

    function cacheDOMElements() {
        dom.videoGrid = document.getElementById('video-grid');
        dom.videoGridView = document.getElementById('video-grid-view');
        dom.videoWatchView = document.getElementById('video-watch-view');
        dom.uploadBtn = document.getElementById('show-upload-btn');
        dom.backToVideosBtn = document.getElementById('back-to-videos-btn');
        dom.playerContainer = document.getElementById('video-player-container');
        dom.downloadNotesBtn = document.getElementById('download-notes-btn');
    }

    function setupEventListeners() {
        if (dom.uploadBtn) {
            dom.uploadBtn.addEventListener('click', showUploadModal);
        }
        
        if (dom.backToVideosBtn) {
            dom.backToVideosBtn.addEventListener('click', showVideoGrid);
        }
        
        if (dom.downloadNotesBtn) {
            dom.downloadNotesBtn.addEventListener('click', downloadNotes);
        }
    }

    // ==================== STATE MANAGEMENT ====================
    function loadState() {
        try {
            const savedProgress = localStorage.getItem('skillforge_video_progress');
            if (savedProgress) {
                state.watchProgress = JSON.parse(savedProgress);
            }
        } catch (e) {
            console.error('[VideoLibrary] Error loading state:', e);
        }
    }

    function saveState() {
        try {
            localStorage.setItem('skillforge_video_progress', JSON.stringify(state.watchProgress));
        } catch (e) {
            console.error('[VideoLibrary] Error saving state:', e);
        }
    }

    // ==================== VIDEO GRID ====================
    function renderVideoGrid() {
        console.log('[VideoLibrary] Rendering video grid...');
        
        if (!dom.videoGrid) {
            console.error('[VideoLibrary] Video grid element not found');
            return;
        }
        
        state.currentView = 'grid';
        dom.videoGridView.classList.remove('hidden');
        dom.videoWatchView.classList.add('hidden');
        
        if (state.videos.length === 0) {
            dom.videoGrid.innerHTML = `
                <div class="empty-video-state">
                    <i class="fas fa-video fa-3x"></i>
                    <h3>No Videos Available</h3>
                    <p>Upload your first video to start building your library</p>
                </div>
            `;
            return;
        }
        
        dom.videoGrid.innerHTML = state.videos.map(video => {
            const progress = state.watchProgress[video.id] || { status: 'not-started', progress: 0 };
            
            return `
                <div class="video-card" onclick="window.VideoLibrary.openVideo('${video.id}')">
                    <div class="video-thumbnail">
                        <img src="${video.thumbnail}" alt="${escapeHtml(video.title)}">
                        <div class="video-duration-overlay">
                            <i class="fas fa-clock"></i> ${formatDuration(video.duration)}
                        </div>
                    </div>
                    <div class="video-card-content">
                        <div class="video-card-header">
                            <span class="video-category-badge ${video.category}">${video.category}</span>
                        </div>
                        <h3 class="video-card-title">${escapeHtml(video.title)}</h3>
                        <p class="video-card-description">${escapeHtml(video.description)}</p>
                        <div class="video-tags">
                            ${video.tags.slice(0, 3).map(tag => 
                                `<span class="video-tag">${escapeHtml(tag)}</span>`
                            ).join('')}
                        </div>
                        <div class="video-card-footer">
                            <span class="video-duration">
                                <i class="fas fa-play-circle"></i> ${formatDuration(video.duration)}
                            </span>
                            <span class="video-progress-badge ${progress.status}">${formatStatus(progress.status)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        console.log('[VideoLibrary] Rendered', state.videos.length, 'videos');
    }

    function showVideoGrid() {
        // Stop video if playing
        if (state.videoPlayer) {
            state.videoPlayer = null;
        }
        
        state.currentView = 'grid';
        dom.videoGridView.classList.remove('hidden');
        dom.videoWatchView.classList.add('hidden');
        
        renderVideoGrid();
    }

    // ==================== VIDEO WATCH ====================
    function openVideo(videoId) {
        const video = state.videos.find(v => v.id === videoId);
        if (!video) {
            console.error('[VideoLibrary] Video not found:', videoId);
            return;
        }
        
        state.currentVideo = video;
        state.currentView = 'watch';
        
        dom.videoGridView.classList.add('hidden');
        dom.videoWatchView.classList.remove('hidden');
        
        renderVideoWatch();
    }

    function renderVideoWatch() {
        if (!state.currentVideo) return;
        
        const video = state.currentVideo;
        const progress = state.watchProgress[video.id] || { status: 'not-started', progress: 0, watchedSeconds: 0 };
        
        // Update video info
        document.getElementById('watch-video-title').textContent = video.title;
        document.getElementById('watch-video-category').textContent = video.category;
        document.getElementById('watch-video-category').className = `video-category-badge ${video.category}`;
        document.getElementById('watch-video-duration').innerHTML = `<i class="fas fa-clock"></i> ${formatDuration(video.duration)}`;
        document.getElementById('watch-video-progress').textContent = formatStatus(progress.status);
        document.getElementById('watch-video-progress').className = `video-progress-badge ${progress.status}`;
        document.getElementById('watch-video-description').textContent = video.description;
        
        // Render tags
        const tagsContainer = document.getElementById('watch-video-tags');
        tagsContainer.innerHTML = video.tags.map(tag => 
            `<span class="video-tag">${escapeHtml(tag)}</span>`
        ).join('');
        
        // Render video player
        renderVideoPlayer(video);
        
        // Update notes section
        updateNotesSection(progress.status === 'completed');
    }

    function renderVideoPlayer(video) {
        if (!dom.playerContainer) return;
        
        // Extract YouTube video ID if it's a YouTube URL
        let embedUrl = video.videoUrl;
        if (video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be')) {
            // Already an embed URL
            embedUrl = video.videoUrl;
        }
        
        dom.playerContainer.innerHTML = `
            <iframe 
                src="${embedUrl}?enablejsapi=1" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
                id="video-iframe"
            ></iframe>
        `;
        
        // Simulate video tracking
        setupVideoTracking(video);
    }

    function setupVideoTracking(video) {
        // Simulate video completion after watching for a bit
        // In production, this would use YouTube API or video events
        
        const iframe = document.getElementById('video-iframe');
        if (!iframe) return;
        
        // Mark as in-progress immediately
        updateVideoProgress(video.id, 'in-progress', 10);
        
        // Simulate completion after 30 seconds (for demo purposes)
        setTimeout(() => {
            if (state.currentVideo && state.currentVideo.id === video.id) {
                updateVideoProgress(video.id, 'completed', 100);
                updateNotesSection(true);
                showNotification('Video completed! Notes unlocked.', 'success');
            }
        }, 30000); // 30 seconds
    }

    function updateVideoProgress(videoId, status, progress) {
        if (!state.watchProgress[videoId]) {
            state.watchProgress[videoId] = {};
        }
        
        state.watchProgress[videoId].status = status;
        state.watchProgress[videoId].progress = progress;
        state.watchProgress[videoId].watchedSeconds = Math.floor((progress / 100) * state.videos.find(v => v.id === videoId).duration);
        
        saveState();
        
        // Update badge if we're watching this video
        if (state.currentVideo && state.currentVideo.id === videoId) {
            const badge = document.getElementById('watch-video-progress');
            if (badge) {
                badge.textContent = formatStatus(status);
                badge.className = `video-progress-badge ${status}`;
            }
        }
    }

    // ==================== NOTES SECTION ====================
    function updateNotesSection(unlocked) {
        const notesSection = document.getElementById('video-notes-section');
        if (!notesSection) return;
        
        if (unlocked) {
            notesSection.className = 'video-notes-section unlocked visible';
            
            // Generate professional AI notes
            const content = generateNotesContent(state.currentVideo);
            
            notesSection.innerHTML = `
                <div class="notes-header">
                    <h3><i class="fas fa-brain" style="color:var(--accent-cyan);"></i> AI Knowledge Graph</h3>
                    <button class="btn btn-secondary" onclick="window.VideoLibrary.downloadNotes()">
                        <i class="fas fa-download"></i> PDF
                    </button>
                </div>
                <div class="notes-content">
                    <div class="ai-summary-module">
                        <div class="module-header">EXECUTIVE SUMMARY</div>
                        <p>${content.summary}</p>
                    </div>
                    
                    <div class="ai-concepts-grid">
                        ${content.points.map(p => `
                            <div class="concept-card">
                                <div class="concept-title">${p.title}</div>
                                <div class="concept-desc">${p.desc}</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="ai-action-module">
                        <div class="module-header">RECOMMENDED ACTIONS</div>
                        <p>Complete the associated assessment to verify competency in ${state.currentVideo.tags[0] || 'this topic'}.</p>
                    </div>
                </div>
            `;
        } else {
            notesSection.className = 'video-notes-section locked visible';
            notesSection.innerHTML = `
                <div class="notes-locked-overlay">
                    <div class="lock-icon-container">
                        <i class="fas fa-lock"></i>
                    </div>
                    <h3>Encrypted Content</h3>
                    <p>Complete video playback to decrypt AI-generated study materials and source code analysis.</p>
                </div>
            `;
        }
    }

    function generateNotesContent(video) {
        // Mock AI generation with elite phrasing
        const desc = video ? video.description : 'Content analysis pending...';
        const tags = video ? video.tags : ['General'];
        
        return {
            summary: desc,
            points: [
                { 
                    title: 'Core Methodology', 
                    desc: `Fundamental analysis of ${tags[0] || 'system architecture'} workflow and optimization strategies.` 
                },
                { 
                    title: 'Implementation Vector', 
                    desc: 'Tactical deployment steps for integrating these concepts into high-availability environments.' 
                },
                { 
                    title: 'Performance Metrics', 
                    desc: 'Key Performance Indicators (KPIs) for monitoring system efficiency and throughput.' 
                },
                {
                    title: 'Strategic Value',
                    desc: 'Long-term benefits of adopting these patterns in enterprise-scale applications.'
                }
            ]
        };
    }

    function downloadNotes() {
        if (!state.currentVideo) return;
        
        const video = state.currentVideo;
        const progress = state.watchProgress[video.id];
        
        if (!progress || progress.status !== 'completed') {
            showNotification('Complete watching the video to download notes', 'warning');
            return;
        }
        
        // Generate PDF content (simulated)
        const pdfContent = `
SkillForge Video Notes
=====================

Video: ${video.title}
Category: ${video.category}
Duration: ${formatDuration(video.duration)}
Subject: ${video.subject || 'General'}

Description:
${video.description}

Key Topics:
${video.tags.map(tag => `- ${tag}`).join('\n')}

Summary:
This video provides comprehensive coverage of ${video.title}. The content is designed for ${video.category} level learners.

Notes generated on ${new Date().toLocaleDateString()}
        `;
        
        // Create blob and download
        const blob = new Blob([pdfContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${video.title.replace(/[^a-z0-9]/gi, '_')}_notes.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Notes downloaded successfully!', 'success');
    }

    // ==================== UPLOAD MODAL ====================
    function showUploadModal() {
        // Create modal if it doesn't exist
        if (document.getElementById('video-upload-modal')) {
            document.getElementById('video-upload-modal').classList.remove('hidden');
            return;
        }
        
        const modalHTML = `
            <div id="video-upload-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Upload Video</h3>
                        <button class="modal-close" onclick="window.VideoLibrary.closeUploadModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="video-upload-form" onsubmit="window.VideoLibrary.handleUpload(event)">
                            <div class="form-grid">
                                <div class="form-group full-width">
                                    <label>Video Title *</label>
                                    <input type="text" id="upload-title" required placeholder="Introduction to Python">
                                </div>
                                <div class="form-group full-width">
                                    <label>Description</label>
                                    <textarea id="upload-description" rows="3" placeholder="Brief description of the video content"></textarea>
                                </div>
                                <div class="form-group">
                                    <label>Video URL *</label>
                                    <input type="url" id="upload-url" required placeholder="https://youtube.com/...">
                                </div>
                                <div class="form-group">
                                    <label>Duration (seconds) *</label>
                                    <input type="number" id="upload-duration" required placeholder="600">
                                </div>
                                <div class="form-group">
                                    <label>Category</label>
                                    <select id="upload-category">
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Subject</label>
                                    <input type="text" id="upload-subject" placeholder="Programming, Aptitude, Theory...">
                                </div>
                                <div class="form-group full-width">
                                    <label>Tags (comma-separated)</label>
                                    <input type="text" id="upload-tags" placeholder="python, programming, tutorial">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-ghost" onclick="window.VideoLibrary.closeUploadModal()">Cancel</button>
                        <button class="btn btn-primary" onclick="document.getElementById('video-upload-form').dispatchEvent(new Event('submit'))">
                            <i class="fas fa-upload"></i> Upload Video
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    function closeUploadModal() {
        const modal = document.getElementById('video-upload-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    function handleUpload(event) {
        event.preventDefault();
        
        const newVideo = {
            id: 'v' + (state.videos.length + 1),
            title: document.getElementById('upload-title').value,
            description: document.getElementById('upload-description').value,
            duration: parseInt(document.getElementById('upload-duration').value),
            category: document.getElementById('upload-category').value,
            subject: document.getElementById('upload-subject').value || 'General',
            tags: document.getElementById('upload-tags').value.split(',').map(t => t.trim()).filter(t => t),
            thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180"%3E%3Crect fill="%231a1a1a" width="320" height="180"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23666" font-size="16" dy=".3em"%3ENew Video%3C/text%3E%3C/svg%3E',
            videoUrl: document.getElementById('upload-url').value
        };
        
        state.videos.unshift(newVideo); // Add to beginning
        
        closeUploadModal();
        renderVideoGrid();
        showNotification('Video uploaded successfully!', 'success');
    }

    // ==================== UTILITY FUNCTIONS ====================
    function formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function formatStatus(status) {
        const statusMap = {
            'not-started': 'Not Started',
            'in-progress': 'In Progress',
            'completed': 'Completed'
        };
        return statusMap[status] || status;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showNotification(message, type = 'info') {
        // Simple notification
        console.log(`[VideoLibrary] ${type.toUpperCase()}: ${message}`);
        
        // You can add a toast notification here
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: var(--bg-card);
            border: 1px solid var(--border-dim);
            border-left: 4px solid ${type === 'success' ? 'var(--success)' : type === 'warning' ? 'var(--warning)' : 'var(--accent-primary)'};
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10001;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // ==================== PUBLIC API ====================
    window.VideoLibrary = {
        init,
        renderVideoGrid,
        openVideo,
        showUploadModal,
        closeUploadModal,
        handleUpload
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('[VideoLibrary] Module loaded');
})();
