const Video = require('../models/Video');
const VideoProgress = require('../models/VideoProgress');
const VideoNotes = require('../models/VideoNotes');

class VideoController {
  // Upload new video (temporarily unauthenticated)
  static async uploadVideo(req, res, next) {
    try {
      const { title, description, videoUrl, thumbnailUrl, durationSeconds, level, tags, moduleId, category } = req.body;
      const uploadedBy = req.user ? req.user.id : null; // Null if no auth

      console.log('[VideoController] Upload request:', { title, videoUrl, level, category });

      if (!title || !videoUrl || !durationSeconds) {
        return res.status(400).json({ 
          success: false,
          error: 'Title, video URL, and duration are required' 
        });
      }

      if (level && !['beginner', 'intermediate', 'advanced'].includes(level)) {
        return res.status(400).json({ 
          success: false,
          error: 'Level must be beginner, intermediate, or advanced' 
        });
      }

      const videoId = await Video.create(
        title,
        description || '',
        videoUrl,
        thumbnailUrl || '',
        durationSeconds,
        level || null,
        tags || '',
        moduleId || null,
        uploadedBy
      );

      console.log('[VideoController] Video created with ID:', videoId);

      res.status(201).json({
        success: true,
        message: 'Video uploaded successfully',
        videoId,
        video: {
          id: videoId,
          title,
          description,
          videoUrl,
          thumbnailUrl,
          level,
          category
        }
      });
    } catch (error) {
      console.error('[VideoController] Upload error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to upload video'
      });
    }
  }

  // Get all videos (public)
  static async getAllVideos(req, res, next) {
    try {
      console.log('[VideoController] getAllVideos called');
      const { level } = req.query;
      console.log('[VideoController] Level filter:', level);
      
      const videos = await Video.findAll(level);
      console.log('[VideoController] Found videos:', videos.length);
      
      // If user is authenticated, include progress
      if (req.user) {
        const userId = req.user.id;
        const progressData = await VideoProgress.findByUser(userId);
        
        const progressMap = {};
        progressData.forEach(p => {
          progressMap[p.video_id] = {
            progress_percentage: p.progress_percentage,
            completed: p.completed === 1,
            last_watched_at: p.last_watched_at
          };
        });
        
        videos.forEach(video => {
          video.user_progress = progressMap[video.id] || null;
        });
      }

      console.log('[VideoController] Sending response');
      res.json({ videos });
    } catch (error) {
      console.error('[VideoController] Error:', error);
      next(error);
    }
  }

  // Get single video by ID
  static async getVideoById(req, res, next) {
    try {
      const { id } = req.params;
      const video = await Video.findById(id);
      
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      // If user is authenticated, include progress
      if (req.user) {
        const progress = await VideoProgress.findByUserAndVideo(req.user.id, id);
        video.user_progress = progress || null;
      }

      res.json({ video });
    } catch (error) {
      next(error);
    }
  }

  // Update video progress
  static async updateProgress(req, res, next) {
    try {
      const { id } = req.params;
      const { progressSeconds, progressPercentage } = req.body;
      const userId = req.user.id;

      if (progressPercentage < 0 || progressPercentage > 100) {
        return res.status(400).json({ 
          error: 'Progress percentage must be between 0 and 100' 
        });
      }

      const completed = progressPercentage >= 100;

      await VideoProgress.upsert(
        userId,
        id,
        progressSeconds,
        progressPercentage,
        completed
      );

      // Auto-generate notes if video just completed and notes don't exist
      if (completed) {
        const existingNotes = await VideoNotes.findByVideoId(id);
        if (!existingNotes) {
          const video = await Video.findById(id);
          if (video) {
            // Generate default notes
            const notesContent = this.generateDefaultNotes(video);
            const timestamps = this.generateDefaultTimestamps(video);
            await VideoNotes.create(id, notesContent, timestamps);
          }
        }
      }

      res.json({
        message: 'Progress updated',
        completed,
        progressPercentage
      });
    } catch (error) {
      next(error);
    }
  }

  // Generate default notes content
  static generateDefaultNotes(video) {
    return `
      <h2>Video Summary</h2>
      <p>This video covers: <strong>${video.title}</strong></p>
      <p>${video.description || 'No description available.'}</p>
      
      <h2>Key Topics</h2>
      <ul>
        <li>Main concepts covered in the video</li>
        <li>Important techniques and best practices</li>
        <li>Common pitfalls to avoid</li>
      </ul>
      
      <h2>Next Steps</h2>
      <p>Practice the concepts learned in this video by:</p>
      <ul>
        <li>Completing related coding challenges</li>
        <li>Building a small project using these skills</li>
        <li>Reviewing the video sections as needed</li>
      </ul>
    `;
  }

  // Generate default timestamps
  static generateDefaultTimestamps(video) {
    const duration = video.duration_seconds;
    const timestamps = [];
    
    // Introduction
    timestamps.push({
      time: 0,
      title: 'Introduction',
      content: 'Overview of the video content and learning objectives.'
    });
    
    // Main content (split into sections)
    if (duration > 300) { // If video is longer than 5 minutes
      const quarter = Math.floor(duration / 4);
      timestamps.push({
        time: quarter,
        title: 'Core Concepts',
        content: 'Deep dive into the fundamental concepts.'
      });
      timestamps.push({
        time: quarter * 2,
        title: 'Practical Examples',
        content: 'Hands-on demonstrations and code examples.'
      });
      timestamps.push({
        time: quarter * 3,
        title: 'Advanced Topics',
        content: 'Advanced techniques and best practices.'
      });
    }
    
    return timestamps;
  }

  // Get video notes (only if completed)
  static async getVideoNotes(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if user has completed the video
      const isCompleted = await VideoProgress.isVideoCompleted(userId, id);

      if (!isCompleted) {
        return res.status(403).json({
          error: 'You must complete watching this video to access notes',
          locked: true
        });
      }

      const notes = await VideoNotes.findByVideoId(id);

      if (!notes) {
        return res.status(404).json({ error: 'Notes not found for this video' });
      }

      res.json({ notes, locked: false });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Create/update notes for a video
  static async upsertVideoNotes(req, res, next) {
    try {
      const { id } = req.params;
      const { content, timestamps } = req.body;

      if (!content) {
        return res.status(400).json({ error: 'Notes content is required' });
      }

      await VideoNotes.upsert(id, content, timestamps || []);

      res.json({ message: 'Notes saved successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Delete video
  static async deleteVideo(req, res, next) {
    try {
      const { id } = req.params;
      await Video.delete(id);
      res.json({ message: 'Video deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = VideoController;
