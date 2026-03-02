const db = require('../config/database');

const initializeDatabase = async () => {
  try {
    await db.connect();

    console.log('Ensuring database tables exist (safe – preserves data)...');

    // Create institutions table
    await db.run(`
      CREATE TABLE IF NOT EXISTS institutions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('school', 'college', 'university')),
        location TEXT,
        created_at TEXT NOT NULL
      )
    `);

    // Create users table
    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        institution_id INTEGER NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT DEFAULT 'student' CHECK(role IN ('student', 'admin', 'instructor')),
        created_at TEXT NOT NULL,
        last_login TEXT,
        FOREIGN KEY (institution_id) REFERENCES institutions(id)
      )
    `);

    // Create tracks table
    await db.run(`
      CREATE TABLE IF NOT EXISTS tracks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        color TEXT,
        display_order INTEGER DEFAULT 0
      )
    `);

    // Create user_tracks table (many-to-many with active status)
    await db.run(`
      CREATE TABLE IF NOT EXISTS user_tracks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        track_id INTEGER NOT NULL,
        is_active INTEGER DEFAULT 0 CHECK(is_active IN (0, 1)),
        enrolled_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (track_id) REFERENCES tracks(id),
        UNIQUE(user_id, track_id)
      )
    `);

    // Create modules table
    await db.run(`
      CREATE TABLE IF NOT EXISTS modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        track_id INTEGER NOT NULL,
        level TEXT NOT NULL CHECK(level IN ('beginner', 'intermediate', 'advanced')),
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL CHECK(category IN ('fundamentals', 'data-structures', 'algorithms', 'projects', 'practice')),
        estimated_hours INTEGER DEFAULT 0,
        sequence_order INTEGER NOT NULL,
        FOREIGN KEY (track_id) REFERENCES tracks(id)
      )
    `);

    // Create module_prerequisites table (self-referencing many-to-many)
    await db.run(`
      CREATE TABLE IF NOT EXISTS module_prerequisites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_id INTEGER NOT NULL,
        prerequisite_id INTEGER NOT NULL,
        FOREIGN KEY (module_id) REFERENCES modules(id),
        FOREIGN KEY (prerequisite_id) REFERENCES modules(id),
        UNIQUE(module_id, prerequisite_id)
      )
    `);

    // Create user_progress table
    await db.run(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        track_id INTEGER NOT NULL,
        module_id INTEGER NOT NULL,
        status TEXT DEFAULT 'completed' CHECK(status IN ('completed', 'in-progress')),
        completed_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (track_id) REFERENCES tracks(id),
        FOREIGN KEY (module_id) REFERENCES modules(id),
        UNIQUE(user_id, track_id, module_id)
      )
    `);

    // Create videos table
    await db.run(`
      CREATE TABLE IF NOT EXISTS videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        video_url TEXT NOT NULL,
        thumbnail_url TEXT,
        duration_seconds INTEGER NOT NULL,
        level TEXT CHECK(level IN ('beginner', 'intermediate', 'advanced')),
        tags TEXT,
        module_id INTEGER,
        uploaded_by INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        FOREIGN KEY (uploaded_by) REFERENCES users(id),
        FOREIGN KEY (module_id) REFERENCES modules(id)
      )
    `);

    // Create video_progress table
    await db.run(`
      CREATE TABLE IF NOT EXISTS video_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        video_id INTEGER NOT NULL,
        progress_seconds INTEGER DEFAULT 0,
        progress_percentage INTEGER DEFAULT 0,
        completed INTEGER DEFAULT 0 CHECK(completed IN (0, 1)),
        last_watched_at TEXT NOT NULL,
        completed_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (video_id) REFERENCES videos(id),
        UNIQUE(user_id, video_id)
      )
    `);

    // Create video_notes table
    await db.run(`
      CREATE TABLE IF NOT EXISTS video_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        video_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        timestamps TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT,
        FOREIGN KEY (video_id) REFERENCES videos(id),
        UNIQUE(video_id)
      )
    `);

    // Create projects_workspace table
    await db.run(`
      CREATE TABLE IF NOT EXISTS projects_workspace (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        tech_stack TEXT,
        visibility TEXT DEFAULT 'private' CHECK(visibility IN ('private', 'public')),
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'archived')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create projects_files table
    await db.run(`
      CREATE TABLE IF NOT EXISTS projects_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        commit_hash TEXT,
        file_path TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_type TEXT,
        file_size INTEGER,
        file_content TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects_workspace(id)
      )
    `);

    // Create projects_commits table
    await db.run(`
      CREATE TABLE IF NOT EXISTS projects_commits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        commit_hash TEXT UNIQUE NOT NULL,
        message TEXT NOT NULL,
        files_count INTEGER DEFAULT 0,
        total_lines INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects_workspace(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create projects_ai_reviews table
    await db.run(`
      CREATE TABLE IF NOT EXISTS projects_ai_reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        commit_hash TEXT UNIQUE NOT NULL,
        overall_score INTEGER DEFAULT 0,
        code_quality TEXT,
        best_practices TEXT,
        performance TEXT,
        security TEXT,
        maintainability TEXT,
        documentation TEXT,
        suggestions TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (commit_hash) REFERENCES projects_commits(commit_hash)
      )
    `);

    // Create indexes for better performance
    await db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_users_institution ON users(institution_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_user_tracks_user ON user_tracks(user_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_user_tracks_active ON user_tracks(user_id, is_active)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_modules_track ON modules(track_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_modules_track_level ON modules(track_id, level)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_progress_user_track ON user_progress(user_id, track_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_videos_order ON videos(display_order)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_video_progress_user ON video_progress(user_id, video_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_video_progress_completed ON video_progress(user_id, completed)`);

    console.log('Database initialized successfully!');
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = initializeDatabase;
