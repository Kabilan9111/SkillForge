-- ============================================
-- PROJECT WORKSPACE DATABASE SCHEMA
-- GitHub-like project management system
-- ============================================

-- Projects Workspace table
CREATE TABLE IF NOT EXISTS projects_workspace (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    tech_stack TEXT, -- JSON array
    visibility TEXT DEFAULT 'private', -- private, public
    repository_size INTEGER DEFAULT 0, -- bytes
    total_commits INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_commit_at DATETIME,
    status TEXT DEFAULT 'active', -- active, archived
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Project Files table (version-controlled file storage)
CREATE TABLE IF NOT EXISTS project_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    commit_id INTEGER,
    file_path TEXT NOT NULL, -- relative path in project
    file_name TEXT NOT NULL,
    file_type TEXT, -- extension
    file_size INTEGER, -- bytes
    content_hash TEXT, -- SHA-256 hash for deduplication
    storage_path TEXT, -- actual file location
    is_binary BOOLEAN DEFAULT 0,
    lines_of_code INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects_workspace(id) ON DELETE CASCADE,
    FOREIGN KEY (commit_id) REFERENCES project_commits(id) ON DELETE SET NULL
);

-- Project Commits table (version control)
CREATE TABLE IF NOT EXISTS project_commits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    commit_hash TEXT UNIQUE NOT NULL, -- SHA-1 style
    parent_commit_hash TEXT, -- previous commit
    commit_message TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    files_changed INTEGER DEFAULT 0,
    lines_added INTEGER DEFAULT 0,
    lines_removed INTEGER DEFAULT 0,
    commit_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    snapshot_path TEXT, -- directory containing this commit's snapshot
    metadata TEXT, -- JSON: affected files, changes summary
    FOREIGN KEY (project_id) REFERENCES projects_workspace(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- AI Review Results table
CREATE TABLE IF NOT EXISTS project_ai_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    commit_id INTEGER NOT NULL,
    review_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Overall metrics
    overall_rating REAL, -- 0-10
    developer_level TEXT, -- Beginner, Intermediate, Advanced, Senior
    
    -- 6-Layer Scores (0-100)
    syntax_score REAL,
    architecture_score REAL,
    performance_score REAL,
    security_score REAL,
    maintainability_score REAL,
    industry_benchmark_score REAL,
    
    -- Detailed analysis
    code_structure_score REAL,
    scalability_score REAL,
    
    -- Comparison with previous commit
    improvement_percentage REAL,
    regression_detected BOOLEAN DEFAULT 0,
    technical_debt_delta REAL,
    
    -- Detailed findings (JSON arrays)
    positive_aspects TEXT, -- JSON array
    weaknesses TEXT, -- JSON array
    recommendations TEXT, -- JSON array
    security_issues TEXT, -- JSON array
    code_smells TEXT, -- JSON array
    duplications TEXT, -- JSON array
    unused_files TEXT, -- JSON array
    
    -- AI processing metadata
    ai_model_used TEXT,
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    analysis_cost REAL,
    
    FOREIGN KEY (project_id) REFERENCES projects_workspace(id) ON DELETE CASCADE,
    FOREIGN KEY (commit_id) REFERENCES project_commits(id) ON DELETE CASCADE
);

-- Project Evaluation Comparisons table
CREATE TABLE IF NOT EXISTS project_evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    commit_id_current INTEGER NOT NULL,
    commit_id_previous INTEGER,
    evaluation_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Delta metrics
    quality_delta REAL,
    performance_delta REAL,
    security_delta REAL,
    complexity_delta REAL,
    maintainability_delta REAL,
    
    -- Trend indicators
    overall_trend TEXT, -- improving, declining, stable
    health_score REAL, -- 0-100
    
    -- Detailed comparison (JSON)
    improvements TEXT, -- JSON array
    regressions TEXT, -- JSON array
    stability_metrics TEXT, -- JSON object
    
    FOREIGN KEY (project_id) REFERENCES projects_workspace(id) ON DELETE CASCADE,
    FOREIGN KEY (commit_id_current) REFERENCES project_commits(id),
    FOREIGN KEY (commit_id_previous) REFERENCES project_commits(id)
);

-- File Change History (for diff tracking)
CREATE TABLE IF NOT EXISTS file_changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    commit_id INTEGER NOT NULL,
    file_id INTEGER NOT NULL,
    change_type TEXT NOT NULL, -- added, modified, deleted, renamed
    old_content_hash TEXT,
    new_content_hash TEXT,
    lines_added INTEGER DEFAULT 0,
    lines_removed INTEGER DEFAULT 0,
    diff_data TEXT, -- JSON: line-by-line diff
    FOREIGN KEY (commit_id) REFERENCES project_commits(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES project_files(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_workspace_user ON projects_workspace(user_id);
CREATE INDEX IF NOT EXISTS idx_project_files_project ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_commit ON project_files(commit_id);
CREATE INDEX IF NOT EXISTS idx_project_commits_project ON project_commits(project_id);
CREATE INDEX IF NOT EXISTS idx_project_commits_hash ON project_commits(commit_hash);
CREATE INDEX IF NOT EXISTS idx_ai_reviews_project ON project_ai_reviews(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_reviews_commit ON project_ai_reviews(commit_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_project ON project_evaluations(project_id);
CREATE INDEX IF NOT EXISTS idx_file_changes_commit ON file_changes(commit_id);
