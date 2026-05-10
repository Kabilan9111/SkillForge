'use strict';

/**
 * =========================================================
 * PROJECT PARSER — Real Project Structure Intelligence
 * =========================================================
 * Scans uploaded workspace_files to detect:
 * - Tech stack (React, Next.js, Express, Python, etc.)
 * - Project type and purpose
 * - File structure metrics
 * - Dependencies
 * - API routes
 * - Component counts
 * =========================================================
 */

// Extension → language mapping
const EXT_TO_LANG = {
  js: 'JavaScript', jsx: 'React/JSX', ts: 'TypeScript', tsx: 'React/TSX',
  py: 'Python', java: 'Java', cs: 'C#', rb: 'Ruby', go: 'Go',
  php: 'PHP', cpp: 'C++', c: 'C', rs: 'Rust', swift: 'Swift',
  kt: 'Kotlin', dart: 'Dart', scala: 'Scala', r: 'R', m: 'Objective-C',
  html: 'HTML', css: 'CSS', scss: 'SCSS', sass: 'SASS', less: 'LESS',
  json: 'JSON', yml: 'YAML', yaml: 'YAML', toml: 'TOML', xml: 'XML',
  md: 'Markdown', txt: 'Text', sh: 'Shell', bash: 'Bash', zsh: 'Zsh',
  sql: 'SQL', graphql: 'GraphQL', gql: 'GraphQL', proto: 'Protobuf',
  dockerfile: 'Docker', makefile: 'Makefile', env: 'Config',
  vue: 'Vue.js', svelte: 'Svelte', astro: 'Astro',
};

const CODE_EXTS = new Set([
  'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cs', 'rb', 'go',
  'php', 'cpp', 'c', 'rs', 'swift', 'kt', 'dart', 'scala',
  'html', 'css', 'scss', 'sass', 'less', 'vue', 'svelte', 'astro',
  'sh', 'bash', 'sql', 'graphql',
]);

const SKIP_DIRS = new Set([
  'node_modules', 'dist', 'build', '.git', '.next', '.nuxt',
  '__pycache__', '.cache', 'coverage', '.nyc_output', 'vendor',
  '.venv', 'venv', 'env', '.tox', 'target', 'out', '.output',
]);

function shouldSkip(filePath) {
  const parts = (filePath || '').split(/[/\\]/);
  return parts.some(p => SKIP_DIRS.has(p.toLowerCase()));
}

function getExt(fileName) {
  if (!fileName) return '';
  const name = fileName.toLowerCase();
  if (name === 'dockerfile') return 'dockerfile';
  if (name === 'makefile') return 'makefile';
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot + 1) : '';
}

function countLines(content) {
  if (!content || content.startsWith('[binary')) return 0;
  return content.split('\n').length;
}

// ─── Tech detection rules ─────────────────────────────────────────────────────

function detectTechStack(files) {
  const tech = new Map(); // name → { category, evidence, files[] }
  const deps = {};

  function add(name, category, evidence, file = '') {
    if (!tech.has(name)) tech.set(name, { name, category, evidence: [], files: [] });
    tech.get(name).evidence.push(evidence);
    if (file) tech.get(name).files.push(file);
  }

  for (const f of files) {
    if (shouldSkip(f.file_path)) continue;

    const name = (f.file_name || '').toLowerCase();
    const path = (f.file_path || '').toLowerCase();
    const ext  = getExt(f.file_name);
    const content = f.file_content || '';
    const c = content.toLowerCase();

    // ── Package managers & config files ──────────────────────────────────────
    if (name === 'package.json' && content) {
      try {
        const pkg = JSON.parse(content);
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
        Object.assign(deps, allDeps);

        if (allDeps.react)          add('React', 'Frontend', 'package.json dependency', f.file_path);
        if (allDeps['react-dom'])   add('React', 'Frontend', 'react-dom in package.json', f.file_path);
        if (allDeps.next)           add('Next.js', 'Frontend Framework', 'package.json dependency', f.file_path);
        if (allDeps['@remix-run/react']) add('Remix', 'Frontend Framework', 'package.json dependency', f.file_path);
        if (allDeps.vue)            add('Vue.js', 'Frontend', 'package.json dependency', f.file_path);
        if (allDeps.svelte)         add('Svelte', 'Frontend', 'package.json dependency', f.file_path);
        if (allDeps.angular)        add('Angular', 'Frontend', 'package.json dependency', f.file_path);
        if (allDeps.express)        add('Express.js', 'Backend', 'package.json dependency', f.file_path);
        if (allDeps.fastify)        add('Fastify', 'Backend', 'package.json dependency', f.file_path);
        if (allDeps.koa)            add('Koa.js', 'Backend', 'package.json dependency', f.file_path);
        if (allDeps['socket.io'])   add('Socket.IO', 'Realtime', 'package.json dependency', f.file_path);
        if (allDeps.mongoose)       add('MongoDB + Mongoose', 'Database', 'package.json dependency', f.file_path);
        if (allDeps.prisma || allDeps['@prisma/client']) add('Prisma ORM', 'Database ORM', 'package.json dependency', f.file_path);
        if (allDeps.sequelize)      add('Sequelize ORM', 'Database ORM', 'package.json dependency', f.file_path);
        if (allDeps.knex)           add('Knex.js', 'Query Builder', 'package.json dependency', f.file_path);
        if (allDeps.sqlite3)        add('SQLite', 'Database', 'package.json dependency', f.file_path);
        if (allDeps.pg)             add('PostgreSQL', 'Database', 'package.json dependency', f.file_path);
        if (allDeps.mysql2 || allDeps.mysql) add('MySQL', 'Database', 'package.json dependency', f.file_path);
        if (allDeps.redis || allDeps.ioredis) add('Redis', 'Cache/Queue', 'package.json dependency', f.file_path);
        if (allDeps.redux || allDeps['@reduxjs/toolkit']) add('Redux', 'State Management', 'package.json dependency', f.file_path);
        if (allDeps.zustand)        add('Zustand', 'State Management', 'package.json dependency', f.file_path);
        if (allDeps.recoil)         add('Recoil', 'State Management', 'package.json dependency', f.file_path);
        if (allDeps.vite)           add('Vite', 'Build Tool', 'package.json dependency', f.file_path);
        if (allDeps.webpack)        add('Webpack', 'Build Tool', 'package.json dependency', f.file_path);
        if (allDeps.typescript)     add('TypeScript', 'Language', 'package.json dependency', f.file_path);
        if (allDeps.jest || allDeps.vitest) add('Testing (Jest/Vitest)', 'Testing', 'package.json dependency', f.file_path);
        if (allDeps.cypress || allDeps.playwright) add('E2E Testing', 'Testing', 'package.json dependency', f.file_path);
        if (allDeps['tailwindcss']) add('TailwindCSS', 'CSS Framework', 'package.json dependency', f.file_path);
        if (allDeps['@mui/material'] || allDeps['@material-ui/core']) add('Material UI', 'UI Library', 'package.json dependency', f.file_path);
        if (allDeps['@chakra-ui/react']) add('Chakra UI', 'UI Library', 'package.json dependency', f.file_path);
        if (allDeps['shadcn-ui'] || allDeps['@radix-ui/react-dialog']) add('Shadcn UI / Radix', 'UI Library', 'package.json dependency', f.file_path);
        if (allDeps['framer-motion']) add('Framer Motion', 'Animation', 'package.json dependency', f.file_path);
        if (allDeps.axios)          add('Axios', 'HTTP Client', 'package.json dependency', f.file_path);
        if (allDeps['react-query'] || allDeps['@tanstack/react-query']) add('TanStack Query', 'Data Fetching', 'package.json dependency', f.file_path);
        if (allDeps.graphql)        add('GraphQL', 'API Layer', 'package.json dependency', f.file_path);
        if (allDeps['@apollo/client'] || allDeps['apollo-server']) add('Apollo GraphQL', 'GraphQL', 'package.json dependency', f.file_path);
        if (allDeps['firebase'] || allDeps['@firebase/app']) add('Firebase', 'Backend-as-a-Service', 'package.json dependency', f.file_path);
        if (allDeps['@supabase/supabase-js']) add('Supabase', 'Backend-as-a-Service', 'package.json dependency', f.file_path);
        if (allDeps['jsonwebtoken']) add('JWT Auth', 'Authentication', 'package.json dependency', f.file_path);
        if (allDeps['bcryptjs'] || allDeps['bcrypt']) add('Password Hashing (bcrypt)', 'Security', 'package.json dependency', f.file_path);
        if (allDeps['passport'])    add('Passport.js', 'Authentication', 'package.json dependency', f.file_path);
        if (allDeps['zod'] || allDeps['joi'] || allDeps['yup']) add('Schema Validation', 'Validation', 'package.json dependency', f.file_path);
        if (allDeps['stripe'])      add('Stripe Payments', 'Payments', 'package.json dependency', f.file_path);
        if (allDeps['openai'] || allDeps['@anthropic-ai/sdk']) add('AI/LLM Integration', 'AI', 'package.json dependency', f.file_path);
        if (allDeps['sharp'])       add('Image Processing (Sharp)', 'Media', 'package.json dependency', f.file_path);
        if (allDeps['multer'])      add('File Upload (Multer)', 'File Handling', 'package.json dependency', f.file_path);
        if (allDeps['nodemailer'] || allDeps['resend']) add('Email Service', 'Communication', 'package.json dependency', f.file_path);
        if (allDeps['bull'] || allDeps['bullmq']) add('Job Queue (Bull)', 'Background Jobs', 'package.json dependency', f.file_path);

        if (pkg.name) add('Node.js', 'Runtime', 'package.json present', f.file_path);
      } catch (e) { /* malformed package.json */ }
    }

    if (name === 'requirements.txt' || name === 'setup.py' || name === 'pyproject.toml') {
      add('Python', 'Language', name + ' found', f.file_path);
      if (content.includes('django')) add('Django', 'Backend Framework', 'requirements.txt', f.file_path);
      if (content.includes('flask'))  add('Flask', 'Backend Framework', 'requirements.txt', f.file_path);
      if (content.includes('fastapi')) add('FastAPI', 'Backend Framework', 'requirements.txt', f.file_path);
      if (content.includes('pandas')) add('Pandas', 'Data Science', 'requirements.txt', f.file_path);
      if (content.includes('numpy'))  add('NumPy', 'Data Science', 'requirements.txt', f.file_path);
      if (content.includes('sklearn') || content.includes('scikit-learn')) add('scikit-learn', 'Machine Learning', 'requirements.txt', f.file_path);
      if (content.includes('tensorflow')) add('TensorFlow', 'Deep Learning', 'requirements.txt', f.file_path);
      if (content.includes('torch'))  add('PyTorch', 'Deep Learning', 'requirements.txt', f.file_path);
    }

    if (name === 'dockerfile' || name.includes('dockerfile')) add('Docker', 'DevOps', 'Dockerfile present', f.file_path);
    if (name === 'docker-compose.yml' || name === 'docker-compose.yaml') add('Docker Compose', 'DevOps', 'docker-compose.yml found', f.file_path);
    if (name === '.travis.yml' || name === 'ci.yml' || path.includes('.github/workflows')) add('CI/CD Pipeline', 'DevOps', 'CI config found', f.file_path);
    if (name === 'vercel.json')   add('Vercel', 'Deployment', 'vercel.json found', f.file_path);
    if (name === 'netlify.toml')  add('Netlify', 'Deployment', 'netlify.toml found', f.file_path);
    if (name === 'fly.toml')      add('Fly.io', 'Deployment', 'fly.toml found', f.file_path);
    if (name === '.env.example' || name === '.env.sample') add('Environment Config', 'Config', '.env.example found', f.file_path);
    if (name === 'nginx.conf' || name.includes('nginx')) add('Nginx', 'Infrastructure', 'nginx config found', f.file_path);
    if (name === 'terraform.tf' || name.endsWith('.tf')) add('Terraform', 'Infrastructure as Code', '.tf found', f.file_path);
    if (name === 'jest.config.js' || name === 'jest.config.ts') add('Jest', 'Testing', 'jest.config found', f.file_path);
    if (name === 'vite.config.js' || name === 'vite.config.ts') add('Vite', 'Build Tool', 'vite.config found', f.file_path);
    if (name === 'next.config.js' || name === 'next.config.ts') add('Next.js', 'Frontend Framework', 'next.config found', f.file_path);
    if (name === 'tailwind.config.js' || name === 'tailwind.config.ts') add('TailwindCSS', 'CSS Framework', 'tailwind.config found', f.file_path);
    if (name === 'tsconfig.json') add('TypeScript', 'Language', 'tsconfig.json found', f.file_path);
    if (name === 'go.mod')        add('Go', 'Language', 'go.mod found', f.file_path);
    if (name === 'cargo.toml')    add('Rust', 'Language', 'Cargo.toml found', f.file_path);
    if (name === 'pom.xml')       add('Java/Maven', 'Language', 'pom.xml found', f.file_path);
    if (name === 'build.gradle')  add('Java/Gradle', 'Language', 'build.gradle found', f.file_path);

    // ── Content-based detection ───────────────────────────────────────────────
    if (['js','jsx','ts','tsx'].includes(ext)) {
      if (c.includes('createslice') || c.includes('useselector') || c.includes('usedispatch')) add('Redux', 'State Management', 'Redux hooks/slice usage', f.file_path);
      if (c.includes('usequery') || c.includes('usemutation') || c.includes('react-query')) add('TanStack Query', 'Data Fetching', 'useQuery usage', f.file_path);
      if (c.includes("require('express')") || c.includes('from \'express\'') || c.includes('from "express"')) add('Express.js', 'Backend', 'express import', f.file_path);
      if (c.includes("require('socket.io')") || c.includes("socket.io")) add('Socket.IO', 'Realtime', 'socket.io import', f.file_path);
      if (c.includes('graphql') || c.includes('apollo')) add('GraphQL', 'API Layer', 'GraphQL usage', f.file_path);
      if (c.includes('stripe')) add('Stripe Payments', 'Payments', 'Stripe usage', f.file_path);
      if (c.includes("import react") || c.includes("from 'react'") || c.includes('from "react"')) add('React', 'Frontend', 'React import', f.file_path);
      if (c.includes('usestate') || c.includes('useeffect') || c.includes('useref')) add('React Hooks', 'Frontend Pattern', 'Hook usage', f.file_path);
      if (c.includes('getserversideprops') || c.includes('getstaticprops') || c.includes('app.tsx') && c.includes('layout')) add('Next.js', 'Frontend Framework', 'Next.js pattern', f.file_path);
      if (c.includes('mongoose') || c.includes('model.find') || c.includes('model.save')) add('MongoDB + Mongoose', 'Database', 'Mongoose usage', f.file_path);
      if (c.includes('prisma') || c.includes('prisma.') ) add('Prisma ORM', 'Database ORM', 'Prisma client usage', f.file_path);
      if (c.includes('jwt.sign') || c.includes('jwt.verify')) add('JWT Auth', 'Authentication', 'JWT usage', f.file_path);
      if (c.includes('bcrypt')) add('Password Hashing (bcrypt)', 'Security', 'bcrypt usage', f.file_path);
      if (c.includes("'pg'") || c.includes('"pg"') || c.includes('pool.query') || c.includes('pg.pool')) add('PostgreSQL', 'Database', 'pg usage', f.file_path);
      if (c.includes("'sqlite3'") || c.includes('"sqlite3"') || c.includes('database.sqlite')) add('SQLite', 'Database', 'sqlite3 usage', f.file_path);
      if (c.includes('openai') || c.includes('anthropic') || c.includes('gemini')) add('AI/LLM Integration', 'AI', 'AI SDK usage', f.file_path);
    }
  }

  return { techMap: tech, dependencies: deps };
}

// ─── Structure metrics ────────────────────────────────────────────────────────

function analyzeStructure(files) {
  const validFiles = files.filter(f => !shouldSkip(f.file_path));

  const langCount = {};
  const folderSet = new Set();
  let totalLines = 0;
  let totalSize = 0;
  let codeLines = 0;
  let componentCount = 0;
  let apiRouteCount = 0;
  let testFileCount = 0;
  let configFileCount = 0;
  let maxDepth = 0;
  const largeFiles = [];
  const filesByType = {};

  for (const f of validFiles) {
    const ext = getExt(f.file_name);
    const lang = EXT_TO_LANG[ext] || 'Other';
    const lines = countLines(f.file_content);
    const size = f.file_size || 0;

    langCount[lang] = (langCount[lang] || 0) + 1;
    filesByType[ext] = (filesByType[ext] || 0) + 1;
    totalLines += lines;
    totalSize += size;

    if (CODE_EXTS.has(ext)) codeLines += lines;

    // Folder depth
    const depth = (f.file_path || '').split(/[/\\]/).length - 1;
    if (depth > maxDepth) maxDepth = depth;

    // Folder tracking
    const folder = (f.file_path || '').split(/[/\\]/).slice(0, -1).join('/');
    if (folder) folderSet.add(folder);

    // React components
    if (['jsx', 'tsx'].includes(ext) || (ext === 'js' && /export\s+(default\s+)?function\s+[A-Z]/.test(f.file_content || ''))) {
      componentCount++;
    }

    // API routes
    const fc = (f.file_content || '').toLowerCase();
    if (fc.includes('router.get(') || fc.includes('router.post(') || fc.includes('app.get(') || fc.includes('app.post(')) {
      // Count route definitions
      const matches = (f.file_content || '').match(/router\.(get|post|put|patch|delete)\s*\(|app\.(get|post|put|patch|delete)\s*\(/g);
      if (matches) apiRouteCount += matches.length;
    }
    // Next.js API routes
    if (f.file_path && f.file_path.toLowerCase().includes('/api/') && ['js','ts'].includes(ext)) {
      apiRouteCount++;
    }

    // Test files
    if (/\.(test|spec)\.(js|jsx|ts|tsx)$/.test(f.file_name || '') || f.file_path?.includes('__tests__')) {
      testFileCount++;
    }

    // Config files
    if (/\.(config|rc|env|toml|yaml|yml)(\.|$)/.test(f.file_name || '') || f.file_name?.startsWith('.')) {
      configFileCount++;
    }

    // Large files (> 300 lines)
    if (lines > 300) {
      largeFiles.push({ path: f.file_path, name: f.file_name, lines, size });
    }
  }

  // Top languages by file count
  const languages = Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .map(([lang, count]) => ({
      lang,
      count,
      percentage: Math.round((count / validFiles.length) * 100)
    }));

  return {
    totalFiles: validFiles.length,
    totalLines,
    totalSize,
    codeLines,
    languages,
    filesByType,
    folderCount: folderSet.size,
    maxDepth,
    componentCount,
    apiRouteCount,
    testFileCount,
    configFileCount,
    largeFiles: largeFiles.slice(0, 10),
    hasTests: testFileCount > 0,
    hasDocker: files.some(f => f.file_name?.toLowerCase() === 'dockerfile' || f.file_name?.toLowerCase().includes('dockerfile')),
    hasCI: files.some(f => f.file_path?.toLowerCase().includes('.github/workflows') || f.file_name?.toLowerCase().includes('travis')),
    hasReadme: files.some(f => f.file_name?.toLowerCase().startsWith('readme')),
    hasDotEnv: files.some(f => f.file_name?.toLowerCase() === '.env.example' || f.file_name?.toLowerCase() === '.env.sample'),
  };
}

// ─── Project type inference ───────────────────────────────────────────────────

function inferProjectType(techMap, structure) {
  const techNames = [...techMap.keys()];
  const hasFrontend = techNames.some(t => ['React', 'Vue.js', 'Angular', 'Svelte', 'Next.js'].includes(t));
  const hasBackend = techNames.some(t => ['Express.js', 'Fastify', 'Django', 'Flask', 'FastAPI'].includes(t));
  const hasDB = techNames.some(t => t.toLowerCase().includes('database') || ['MongoDB + Mongoose', 'PostgreSQL', 'MySQL', 'SQLite', 'Prisma ORM', 'Sequelize ORM'].includes(t));
  const hasAI = techNames.includes('AI/LLM Integration');
  const hasMobile = techNames.some(t => t.toLowerCase().includes('react native') || t.toLowerCase().includes('flutter'));
  const hasML = techNames.some(t => ['TensorFlow', 'PyTorch', 'scikit-learn', 'Pandas'].includes(t));

  if (hasML)       return { type: 'Machine Learning / Data Science', icon: '🤖', maturity: 'Research' };
  if (hasAI && hasBackend) return { type: 'AI-Powered SaaS Application', icon: '⚡', maturity: 'Early Production' };
  if (hasMobile)   return { type: 'Mobile Application', icon: '📱', maturity: 'Development' };
  if (hasFrontend && hasBackend && hasDB) return { type: 'Full-Stack Web Application', icon: '🌐', maturity: 'Development' };
  if (hasFrontend && hasBackend) return { type: 'Web Application (Frontend + API)', icon: '🌐', maturity: 'Development' };
  if (hasFrontend && techNames.includes('Next.js')) return { type: 'Next.js Application', icon: '▲', maturity: 'Development' };
  if (hasFrontend) return { type: 'Frontend / SPA Application', icon: '🎨', maturity: 'Development' };
  if (hasBackend && hasDB) return { type: 'Backend API Service', icon: '⚙️', maturity: 'Development' };
  if (hasBackend)  return { type: 'API / Microservice', icon: '🔧', maturity: 'Development' };
  if (structure.languages[0]?.lang === 'Python') return { type: 'Python Application', icon: '🐍', maturity: 'Development' };
  if (structure.languages[0]?.lang === 'Go')     return { type: 'Go Service', icon: '🐹', maturity: 'Development' };
  return { type: 'Software Project', icon: '💻', maturity: 'Development' };
}

// ─── Main parse function ──────────────────────────────────────────────────────

function parse(files) {
  if (!files || files.length === 0) {
    return {
      projectType: { type: 'Unknown', icon: '❓', maturity: 'Unknown' },
      techStack: [],
      structure: { totalFiles: 0, totalLines: 0, languages: [] },
      dependencies: {},
    };
  }

  const { techMap, dependencies } = detectTechStack(files);
  const structure = analyzeStructure(files);
  const projectType = inferProjectType(techMap, structure);

  // Convert techMap to sorted array grouped by category
  const techList = [...techMap.values()].map(t => ({
    name: t.name,
    category: t.category,
    confidence: Math.min(100, t.evidence.length * 40 + 20),
    files: [...new Set(t.files)].slice(0, 3),
  }));

  // Group by category
  const techByCategory = {};
  for (const t of techList) {
    if (!techByCategory[t.category]) techByCategory[t.category] = [];
    techByCategory[t.category].push(t);
  }

  return {
    projectType,
    techStack: techList,
    techByCategory,
    structure,
    dependencies,
    depCount: Object.keys(dependencies).length,
  };
}

module.exports = { parse };
