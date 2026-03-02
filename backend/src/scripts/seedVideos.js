const db = require('../config/database');

async function seedVideos() {
  try {
    await db.connect();
    console.log('Connected to database');

    // Insert sample videos
    // Use data URI for reliable placeholder thumbnails
    const placeholderThumb = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"%3E%3Crect fill="%23667eea" width="320" height="180"/%3E%3Ctext fill="%23ffffff" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EVideo Thumbnail%3C/text%3E%3C/svg%3E';
    
    await db.run(`
      INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, level, tags, module_id, uploaded_by, created_at) 
      VALUES ('Python Basics Tutorial', 'Learn Python fundamentals with this comprehensive beginner-friendly tutorial', 'https://example.com/python-basics.mp4', ?, 1800, 'beginner', 'python,basics,programming', 1, 1, datetime('now'))
    `, [placeholderThumb]);

    await db.run(`
      INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, level, tags, module_id, uploaded_by, created_at) 
      VALUES ('FastAPI Advanced', 'Build modern REST APIs with FastAPI framework', 'https://example.com/fastapi.mp4', ?, 2400, 'intermediate', 'python,api,fastapi,backend', 2, 1, datetime('now'))
    `, [placeholderThumb]);

    await db.run(`
      INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, level, tags, module_id, uploaded_by, created_at) 
      VALUES ('Docker Mastery', 'Master Docker containerization and orchestration', 'https://example.com/docker.mp4', ?, 3000, 'advanced', 'docker,devops,containers', 3, 1, datetime('now'))
    `, [placeholderThumb]);

    console.log('✓ Videos created successfully');

    // Verify
    const videos = await db.all('SELECT id, title, level FROM videos');
    console.log(`✓ Total videos in database: ${videos.length}`);
    videos.forEach(v => console.log(`  - ${v.title} (${v.level})`));

    process.exit(0);
  } catch (error) {
    console.error('Error seeding videos:', error);
    process.exit(1);
  }
}

seedVideos();
