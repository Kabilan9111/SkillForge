const db = require('../config/database');
const Institution = require('../models/Institution');
const User = require('../models/User');
const Track = require('../models/Track');
const Module = require('../models/Module');
const Video = require('../models/Video');
const VideoNotes = require('../models/VideoNotes');

const seedData = async () => {
  try {
    await db.connect();
    console.log('Starting data seeding...');

    // Create sample institutions
    const inst1 = await Institution.create('TechVidya College', 'college', 'Bangalore, India');
    const inst2 = await Institution.create('CodeMaster School', 'school', 'Mumbai, India');
    console.log('✓ Institutions created');

    // Create sample users
    await User.create(inst1, 'student1@techvidya.edu', 'password123', 'Rahul Sharma');
    await User.create(inst1, 'student2@techvidya.edu', 'password123', 'Priya Patel');
    await User.create(inst2, 'student3@codemaster.edu', 'password123', 'Amit Kumar');
    console.log('✓ Users created');

    // Create tracks
    await db.run(`
      INSERT INTO tracks (name, slug, description, color, display_order)
      VALUES 
        ('Java Development', 'java', 'Master Java programming from basics to advanced enterprise applications', '#f89820', 1),
        ('Python Development', 'python', 'Learn Python for web development, data science, and automation', '#3776ab', 2),
        ('C/C++ Development', 'c-cpp', 'Deep dive into system programming and competitive coding with C/C++', '#00599c', 3),
        ('Cloud Computing', 'cloud', 'Master cloud infrastructure, DevOps, and scalable cloud-native architectures', '#4285f4', 4)
    `);
    console.log('✓ Tracks created');

    // Get track IDs
    const javaTrack = await Track.findBySlug('java');
    const pythonTrack = await Track.findBySlug('python');
    const cppTrack = await Track.findBySlug('c-cpp');
    const cloudTrack = await Track.findBySlug('cloud');

    // Seed Java modules (all levels)
    const javaCount = await seedJavaModules(javaTrack.id);
    console.log(`✓ Java modules created (${javaCount} total)`);

    // Seed Python modules (all levels) - PRODUCTION-READY
    const pythonCount = await seedPythonFullStackModules(pythonTrack.id);
    console.log(`✓ Python Full-Stack modules created (${pythonCount} total)`);

    // Seed C/C++ modules (all levels)
    const cppCount = await seedCppModules(cppTrack.id);
    console.log(`✓ C/C++ modules created (${cppCount} total)`);

    // Seed Cloud Computing modules (all levels)
    await seedCloudModules(cloudTrack.id, pythonTrack.id);
    console.log('✓ Cloud Computing modules created');

    // Seed sample videos
    await seedSampleVideos(pythonTrack.id);
    console.log('✓ Sample videos created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nSample credentials:');
    console.log('Email: student1@techvidya.edu');
    console.log('Password: password123');

  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
};

async function seedJavaModules(trackId) {
  // ============ BEGINNER LEVEL - 17 Modules ============
  const b1 = await Module.create(trackId, 'beginner', 'Programming Fundamentals', 'Core programming concepts and problem-solving', 'fundamentals', 4, 1);
  const b2 = await Module.create(trackId, 'beginner', 'Java Installation and JVM Overview', 'Setting up Java environment and understanding JVM', 'fundamentals', 3, 2);
  const b3 = await Module.create(trackId, 'beginner', 'Java Syntax and Structure', 'Basic syntax, structure, and code organization', 'fundamentals', 4, 3);
  const b4 = await Module.create(trackId, 'beginner', 'Variables and Data Types', 'Primitive and reference types', 'fundamentals', 5, 4);
  const b5 = await Module.create(trackId, 'beginner', 'Operators', 'Arithmetic, relational, logical, and bitwise operators', 'fundamentals', 4, 5);
  const b6 = await Module.create(trackId, 'beginner', 'Conditional Statements', 'if, if-else, switch statements', 'fundamentals', 5, 6);
  const b7 = await Module.create(trackId, 'beginner', 'Loops', 'for, while, do-while loops', 'fundamentals', 5, 7);
  const b8 = await Module.create(trackId, 'beginner', 'Arrays', 'Single and multi-dimensional arrays', 'data-structures', 6, 8);
  const b9 = await Module.create(trackId, 'beginner', 'Strings', 'String manipulation and operations', 'fundamentals', 5, 9);
  const b10 = await Module.create(trackId, 'beginner', 'Methods', 'Method declaration, invocation, and scope', 'fundamentals', 6, 10);
  const b11 = await Module.create(trackId, 'beginner', 'Method Overloading', 'Multiple methods with same name', 'fundamentals', 4, 11);
  const b12 = await Module.create(trackId, 'beginner', 'Introduction to OOP', 'Object-oriented programming concepts', 'fundamentals', 5, 12);
  const b13 = await Module.create(trackId, 'beginner', 'Classes and Objects', 'Creating and using classes', 'fundamentals', 6, 13);
  const b14 = await Module.create(trackId, 'beginner', 'Constructors', 'Default and parameterized constructors', 'fundamentals', 5, 14);
  const b15 = await Module.create(trackId, 'beginner', 'Access Modifiers', 'public, private, protected, default', 'fundamentals', 4, 15);
  const b16 = await Module.create(trackId, 'beginner', 'Packages', 'Organizing code with packages', 'fundamentals', 4, 16);
  const b17 = await Module.create(trackId, 'beginner', 'Simple Java Programs', 'Building console applications', 'projects', 8, 17);

  // ============ INTERMEDIATE LEVEL - 23 Modules ============
  const i1 = await Module.create(trackId, 'intermediate', 'OOP Deep Dive', 'Advanced object-oriented concepts', 'fundamentals', 6, 1);
  const i2 = await Module.create(trackId, 'intermediate', 'Inheritance', 'Single and multilevel inheritance', 'fundamentals', 6, 2);
  const i3 = await Module.create(trackId, 'intermediate', 'Polymorphism', 'Method overriding and dynamic binding', 'fundamentals', 6, 3);
  const i4 = await Module.create(trackId, 'intermediate', 'Abstraction', 'Abstract concepts and implementation', 'fundamentals', 5, 4);
  const i5 = await Module.create(trackId, 'intermediate', 'Interfaces', 'Interface design and implementation', 'fundamentals', 6, 5);
  const i6 = await Module.create(trackId, 'intermediate', 'Abstract Classes', 'Abstract classes vs interfaces', 'fundamentals', 5, 6);
  const i7 = await Module.create(trackId, 'intermediate', 'Exception Handling', 'Try-catch, throw, throws', 'fundamentals', 6, 7);
  const i8 = await Module.create(trackId, 'intermediate', 'Custom Exceptions', 'Creating custom exception classes', 'fundamentals', 5, 8);
  const i9 = await Module.create(trackId, 'intermediate', 'Collections Framework', 'Java collections overview', 'data-structures', 8, 9);
  const i10 = await Module.create(trackId, 'intermediate', 'List, Set, and Map', 'ArrayList, HashSet, HashMap', 'data-structures', 8, 10);
  const i11 = await Module.create(trackId, 'intermediate', 'Generics', 'Type-safe collections', 'fundamentals', 6, 11);
  const i12 = await Module.create(trackId, 'intermediate', 'Lambda Expressions', 'Functional programming in Java', 'fundamentals', 6, 12);
  const i13 = await Module.create(trackId, 'intermediate', 'Streams API', 'Functional data processing', 'algorithms', 7, 13);
  const i14 = await Module.create(trackId, 'intermediate', 'File Handling', 'Reading and writing files', 'fundamentals', 6, 14);
  const i15 = await Module.create(trackId, 'intermediate', 'Serialization', 'Object serialization and deserialization', 'fundamentals', 5, 15);
  const i16 = await Module.create(trackId, 'intermediate', 'Multithreading Basics', 'Thread creation and lifecycle', 'algorithms', 7, 16);
  const i17 = await Module.create(trackId, 'intermediate', 'Thread Lifecycle', 'Thread states and transitions', 'algorithms', 6, 17);
  const i18 = await Module.create(trackId, 'intermediate', 'Synchronization', 'Thread safety and synchronization', 'algorithms', 7, 18);
  const i19 = await Module.create(trackId, 'intermediate', 'JVM Memory Model', 'Heap, stack, and garbage collection', 'fundamentals', 6, 19);
  const i20 = await Module.create(trackId, 'intermediate', 'Debugging Techniques', 'Using debuggers and logging', 'practice', 5, 20);
  const i21 = await Module.create(trackId, 'intermediate', 'Unit Testing', 'JUnit testing framework', 'practice', 6, 21);
  const i22 = await Module.create(trackId, 'intermediate', 'Maven or Gradle', 'Build tools and dependency management', 'fundamentals', 6, 22);
  const i23 = await Module.create(trackId, 'intermediate', 'Intermediate-Level Project', 'Building a complete application', 'projects', 20, 23);

  // ============ ADVANCED LEVEL - 20 Modules ============
  const a1 = await Module.create(trackId, 'advanced', 'JVM Internals', 'Deep dive into JVM architecture', 'algorithms', 8, 1);
  const a2 = await Module.create(trackId, 'advanced', 'Garbage Collection Mechanisms', 'GC algorithms and tuning', 'algorithms', 7, 2);
  const a3 = await Module.create(trackId, 'advanced', 'Advanced Multithreading', 'Executors, thread pools, futures', 'algorithms', 8, 3);
  const a4 = await Module.create(trackId, 'advanced', 'Concurrent Collections', 'Thread-safe data structures', 'data-structures', 7, 4);
  const a5 = await Module.create(trackId, 'advanced', 'Design Patterns', 'Singleton, Factory, Observer, Strategy', 'algorithms', 10, 5);
  const a6 = await Module.create(trackId, 'advanced', 'Spring Core', 'IoC and Dependency Injection', 'fundamentals', 8, 6);
  const a7 = await Module.create(trackId, 'advanced', 'Dependency Injection', 'Advanced DI patterns', 'fundamentals', 6, 7);
  const a8 = await Module.create(trackId, 'advanced', 'Spring Boot', 'Building production-ready applications', 'fundamentals', 10, 8);
  const a9 = await Module.create(trackId, 'advanced', 'RESTful APIs', 'REST API design and implementation', 'projects', 10, 9);
  const a10 = await Module.create(trackId, 'advanced', 'Microservices Architecture', 'Service decomposition and communication', 'algorithms', 12, 10);
  const a11 = await Module.create(trackId, 'advanced', 'Security Fundamentals', 'Application security basics', 'fundamentals', 7, 11);
  const a12 = await Module.create(trackId, 'advanced', 'JWT Authentication', 'Token-based authentication', 'algorithms', 6, 12);
  const a13 = await Module.create(trackId, 'advanced', 'Database Optimization', 'Query optimization and indexing', 'data-structures', 8, 13);
  const a14 = await Module.create(trackId, 'advanced', 'JPA and Hibernate', 'ORM frameworks', 'data-structures', 10, 14);
  const a15 = await Module.create(trackId, 'advanced', 'Redis Caching', 'In-memory caching strategies', 'data-structures', 7, 15);
  const a16 = await Module.create(trackId, 'advanced', 'Messaging Systems', 'RabbitMQ, Kafka basics', 'algorithms', 8, 16);
  const a17 = await Module.create(trackId, 'advanced', 'System Design Basics', 'Scalability and architecture', 'algorithms', 10, 17);
  const a18 = await Module.create(trackId, 'advanced', 'Performance Tuning', 'Profiling and optimization', 'algorithms', 8, 18);
  const a19 = await Module.create(trackId, 'advanced', 'Production Deployment', 'CI/CD and deployment strategies', 'practice', 7, 19);
  const a20 = await Module.create(trackId, 'advanced', 'Enterprise Capstone Project', 'Full-stack enterprise application', 'projects', 40, 20);

  // Prerequisites - Beginner (sequential)
  for (let i = 2; i <= 17; i++) {
    await Module.addPrerequisite(eval(`b${i}`), eval(`b${i - 1}`));
  }

  // Prerequisites - Intermediate (sequential with some branches)
  await Module.addPrerequisite(i2, i1);
  await Module.addPrerequisite(i3, i2);
  await Module.addPrerequisite(i4, i3);
  await Module.addPrerequisite(i5, i4);
  await Module.addPrerequisite(i6, i5);
  await Module.addPrerequisite(i7, i1);
  await Module.addPrerequisite(i8, i7);
  await Module.addPrerequisite(i9, i6);
  await Module.addPrerequisite(i10, i9);
  await Module.addPrerequisite(i11, i10);
  await Module.addPrerequisite(i12, i11);
  await Module.addPrerequisite(i13, i12);
  await Module.addPrerequisite(i14, i7);
  await Module.addPrerequisite(i15, i14);
  await Module.addPrerequisite(i16, i13);
  await Module.addPrerequisite(i17, i16);
  await Module.addPrerequisite(i18, i17);
  await Module.addPrerequisite(i19, i18);
  await Module.addPrerequisite(i20, i8);
  await Module.addPrerequisite(i21, i20);
  await Module.addPrerequisite(i22, i21);
  await Module.addPrerequisite(i23, i22);

  // Prerequisites - Advanced (sequential)
  for (let i = 2; i <= 20; i++) {
    await Module.addPrerequisite(eval(`a${i}`), eval(`a${i - 1}`));
  }
}

async function seedPythonFullStackModules(trackId) {
  // BEGINNER: 20 modules - Python fundamentals ONLY
  const b1 = await Module.create(trackId, 'beginner', 'Introduction to Programming Concepts', 'What is programming, algorithms, problem-solving basics', 'fundamentals', 3, 1);
  const b2 = await Module.create(trackId, 'beginner', 'Python Installation and Environment Setup', 'Installing Python, IDE setup, first program', 'fundamentals', 3, 2);
  const b3 = await Module.create(trackId, 'beginner', 'Python Syntax and Indentation', 'Syntax rules, indentation, code structure, comments', 'fundamentals', 4, 3);
  const b4 = await Module.create(trackId, 'beginner', 'Variables and Basic Data Types', 'int, float, str, bool - declaration, type conversion', 'fundamentals', 4, 4);
  const b5 = await Module.create(trackId, 'beginner', 'Input and Output Operations', 'input(), print(), formatting output, string interpolation', 'fundamentals', 3, 5);
  const b6 = await Module.create(trackId, 'beginner', 'Operators and Expressions', 'Arithmetic, comparison, logical, assignment operators', 'fundamentals', 4, 6);
  const b7 = await Module.create(trackId, 'beginner', 'Conditional Statements', 'if, elif, else - decision making and nested conditions', 'fundamentals', 5, 7);
  const b8 = await Module.create(trackId, 'beginner', 'Loops: for and while', 'Iteration, range(), loop patterns, nested loops', 'fundamentals', 5, 8);
  const b9 = await Module.create(trackId, 'beginner', 'Loop Control: break, continue, pass', 'Flow control within loops, else clause in loops', 'fundamentals', 4, 9);
  const b10 = await Module.create(trackId, 'beginner', 'Strings and String Methods', 'String indexing, slicing, methods, immutability', 'fundamentals', 5, 10);
  const b11 = await Module.create(trackId, 'beginner', 'Lists and List Operations', 'List creation, indexing, slicing, methods, mutability', 'data-structures', 6, 11);
  const b12 = await Module.create(trackId, 'beginner', 'Tuples and Their Use Cases', 'Immutable sequences, tuple packing/unpacking', 'data-structures', 4, 12);
  const b13 = await Module.create(trackId, 'beginner', 'Dictionaries and Key-Value Storage', 'dict creation, accessing, modifying, methods', 'data-structures', 6, 13);
  const b14 = await Module.create(trackId, 'beginner', 'Sets and Set Operations', 'Unique collections, set methods, mathematical operations', 'data-structures', 4, 14);
  const b15 = await Module.create(trackId, 'beginner', 'Functions: Definition and Calling', 'def keyword, parameters, return values, scope basics', 'fundamentals', 6, 15);
  const b16 = await Module.create(trackId, 'beginner', 'File Handling Basics', 'Reading and writing text files, with statement, file modes', 'fundamentals', 5, 16);
  const b17 = await Module.create(trackId, 'beginner', 'Exception Handling with try-except', 'Common exceptions, try-except-finally, raising exceptions', 'fundamentals', 5, 17);
  const b18 = await Module.create(trackId, 'beginner', 'Introduction to Classes and Objects', 'Basic class syntax, __init__, methods, self', 'fundamentals', 6, 18);
  const b19 = await Module.create(trackId, 'beginner', 'Code Quality and Debugging', 'PEP 8, naming conventions, print debugging', 'practice', 5, 19);
  const b20 = await Module.create(trackId, 'beginner', 'Beginner Capstone Project', 'Build a small console application', 'projects', 15, 20);

  // INTERMEDIATE: 23 modules - Advanced Python + FastAPI + Databases
  const i1 = await Module.create(trackId, 'intermediate', 'Advanced Function Concepts', 'Nested functions, closures, first-class functions, LEGB scope', 'fundamentals', 6, 1);
  const i2 = await Module.create(trackId, 'intermediate', 'Lambda Functions and Functional Tools', 'lambda, map(), filter(), reduce()', 'fundamentals', 5, 2);
  const i3 = await Module.create(trackId, 'intermediate', 'Decorators', 'Function decorators, @property, wrapping functions', 'algorithms', 7, 3);
  const i4 = await Module.create(trackId, 'intermediate', 'Generators and Iterators', 'yield keyword, generator expressions, iterator protocol', 'algorithms', 7, 4);
  const i5 = await Module.create(trackId, 'intermediate', 'Context Managers', 'with statement, __enter__/__exit__, contextlib', 'fundamentals', 5, 5);
  const i6 = await Module.create(trackId, 'intermediate', 'Modules, Packages, and Import System', 'Creating modules, __init__.py, relative imports', 'fundamentals', 5, 6);
  const i7 = await Module.create(trackId, 'intermediate', 'Virtual Environments and Dependency Management', 'venv, pip, requirements.txt', 'fundamentals', 4, 7);
  const i8 = await Module.create(trackId, 'intermediate', 'Intermediate OOP Design', 'Inheritance, super(), MRO, composition', 'fundamentals', 7, 8);
  const i9 = await Module.create(trackId, 'intermediate', 'Magic Methods and Operator Overloading', '__str__, __repr__, __eq__, __add__', 'fundamentals', 6, 9);
  const i10 = await Module.create(trackId, 'intermediate', 'Working with JSON and Configuration Files', 'json module, YAML, TOML, env variables', 'fundamentals', 5, 10);
  const i11 = await Module.create(trackId, 'intermediate', 'Regular Expressions for Pattern Matching', 're module, patterns, search, match, groups', 'algorithms', 6, 11);
  const i12 = await Module.create(trackId, 'intermediate', 'Introduction to Concurrency', 'Synchronous vs asynchronous, threading basics, GIL', 'algorithms', 6, 12);
  const i13 = await Module.create(trackId, 'intermediate', 'Async/Await Fundamentals', 'asyncio, coroutines, async/await syntax, event loop', 'algorithms', 8, 13);
  const i14 = await Module.create(trackId, 'intermediate', 'HTTP Basics and Requests Library', 'HTTP methods, status codes, requests library', 'fundamentals', 5, 14);
  const i15 = await Module.create(trackId, 'intermediate', 'Introduction to REST APIs', 'REST principles, endpoints, JSON responses', 'fundamentals', 5, 15);
  const i16 = await Module.create(trackId, 'intermediate', 'FastAPI Quick Start', 'Installing FastAPI, creating endpoints, path/query parameters', 'projects', 8, 16);
  const i17 = await Module.create(trackId, 'intermediate', 'SQL Database Fundamentals', 'Relational databases, SQL syntax, CRUD, joins', 'data-structures', 8, 17);
  const i18 = await Module.create(trackId, 'intermediate', 'Database Connectivity with Python', 'sqlite3, psycopg2, connection management, transactions', 'data-structures', 6, 18);
  const i19 = await Module.create(trackId, 'intermediate', 'ORM Basics with SQLAlchemy', 'ORM concept, models, sessions, basic queries', 'data-structures', 8, 19);
  const i20 = await Module.create(trackId, 'intermediate', 'Logging and Monitoring', 'logging module, log levels, handlers, formatters', 'practice', 5, 20);
  const i21 = await Module.create(trackId, 'intermediate', 'Environment Configuration Management', 'python-dotenv, config classes, 12-factor app', 'fundamentals', 4, 21);
  const i22 = await Module.create(trackId, 'intermediate', 'Introduction to Testing', 'pytest basics, writing tests, assertions', 'practice', 6, 22);
  const i23 = await Module.create(trackId, 'intermediate', 'Intermediate Project: Build a REST API', 'Create a CRUD API with FastAPI and SQLAlchemy', 'projects', 25, 23);

  // ADVANCED: 22 modules - Production engineering, Docker, CI/CD, Cloud
  const a1 = await Module.create(trackId, 'advanced', 'Python Internals and Memory Model', 'CPython, bytecode, memory management, GC', 'algorithms', 8, 1);
  const a2 = await Module.create(trackId, 'advanced', 'Performance Profiling and Optimization', 'cProfile, line_profiler, optimization techniques', 'algorithms', 8, 2);
  const a3 = await Module.create(trackId, 'advanced', 'Advanced Concurrency: Threading and Multiprocessing', 'Thread pools, process pools, GIL workarounds', 'algorithms', 9, 3);
  const a4 = await Module.create(trackId, 'advanced', 'Async/Await in Production', 'asyncio patterns, aiohttp, async database drivers', 'algorithms', 9, 4);
  const a5 = await Module.create(trackId, 'advanced', 'Backend Architecture Patterns', 'MVC, layered architecture, dependency injection, SOLID', 'algorithms', 8, 5);
  const a6 = await Module.create(trackId, 'advanced', 'Scalable API Design', 'Pagination, filtering, rate limiting, versioning', 'projects', 7, 6);
  const a7 = await Module.create(trackId, 'advanced', 'Advanced FastAPI Features', 'Dependency injection, background tasks, WebSockets', 'projects', 8, 7);
  const a8 = await Module.create(trackId, 'advanced', 'Authentication and Authorization', 'JWT, OAuth2, session management, RBAC', 'algorithms', 10, 8);
  const a9 = await Module.create(trackId, 'advanced', 'API Security Best Practices', 'OWASP Top 10, input validation, SQL injection prevention', 'fundamentals', 8, 9);
  const a10 = await Module.create(trackId, 'advanced', 'Advanced Database Design and Optimization', 'Indexing, query optimization, database pooling, Alembic', 'data-structures', 9, 10);
  const a11 = await Module.create(trackId, 'advanced', 'Caching Strategies', 'Redis fundamentals, caching patterns, cache invalidation', 'algorithms', 8, 11);
  const a12 = await Module.create(trackId, 'advanced', 'Message Queues and Task Processing', 'Celery, RabbitMQ/Redis, async tasks, worker management', 'algorithms', 9, 12);
  const a13 = await Module.create(trackId, 'advanced', 'Testing in Production Environments', 'Integration tests, mocking, fixtures, coverage', 'practice', 7, 13);
  const a14 = await Module.create(trackId, 'advanced', 'Error Handling and Resilience', 'Custom exceptions, retry logic, circuit breakers', 'fundamentals', 6, 14);
  const a15 = await Module.create(trackId, 'advanced', 'Docker and Containerization', 'Dockerfile, Docker Compose, multi-stage builds', 'practice', 8, 15);
  const a16 = await Module.create(trackId, 'advanced', 'CI/CD Pipeline Setup', 'GitHub Actions, automated testing, deployment automation', 'practice', 7, 16);
  const a17 = await Module.create(trackId, 'advanced', 'Cloud Deployment Fundamentals', 'AWS/GCP/Azure basics, deploying to cloud', 'practice', 8, 17);
  const a18 = await Module.create(trackId, 'advanced', 'Infrastructure as Code', 'Terraform basics, infrastructure automation', 'practice', 7, 18);
  const a19 = await Module.create(trackId, 'advanced', 'Application Monitoring and Observability', 'Logging aggregation, metrics, tracing, alerting', 'practice', 8, 19);
  const a20 = await Module.create(trackId, 'advanced', 'Production Deployment Strategies', 'Blue-green deployment, rolling updates, zero-downtime', 'practice', 7, 20);
  const a21 = await Module.create(trackId, 'advanced', 'Advanced Capstone Project Planning', 'Planning a production-ready application architecture', 'projects', 10, 21);
  const a22 = await Module.create(trackId, 'advanced', 'Advanced Capstone Project Implementation', 'Build and deploy a scalable Python backend system', 'projects', 50, 22);

  // Prerequisites
  for (let i = 2; i <= 20; i++) await Module.addPrerequisite(eval(`b${i}`), eval(`b${i - 1}`));
  for (let i = 2; i <= 23; i++) await Module.addPrerequisite(eval(`i${i}`), eval(`i${i - 1}`));
  for (let i = 2; i <= 22; i++) await Module.addPrerequisite(eval(`a${i}`), eval(`a${i - 1}`));

  return 65; // Total: 20 + 23 + 22
}

async function seedCppModules(trackId) {
  // ============ BEGINNER LEVEL - 15 Modules ============
  const b1 = await Module.create(trackId, 'beginner', 'Programming Basics', 'Introduction to programming concepts', 'fundamentals', 4, 1);
  const b2 = await Module.create(trackId, 'beginner', 'Compilation Process', 'Compiler, linker, executable', 'fundamentals', 4, 2);
  const b3 = await Module.create(trackId, 'beginner', 'Syntax and Structure', 'Basic C/C++ syntax', 'fundamentals', 5, 3);
  const b4 = await Module.create(trackId, 'beginner', 'Variables and Data Types', 'Primitive types and modifiers', 'fundamentals', 5, 4);
  const b5 = await Module.create(trackId, 'beginner', 'Operators', 'Arithmetic, logical, bitwise operators', 'fundamentals', 5, 5);
  const b6 = await Module.create(trackId, 'beginner', 'Conditional Statements', 'if, switch statements', 'fundamentals', 5, 6);
  const b7 = await Module.create(trackId, 'beginner', 'Loops', 'for, while, do-while', 'fundamentals', 5, 7);
  const b8 = await Module.create(trackId, 'beginner', 'Functions', 'Function declaration and definition', 'fundamentals', 6, 8);
  const b9 = await Module.create(trackId, 'beginner', 'Arrays', 'Single and multi-dimensional arrays', 'data-structures', 6, 9);
  const b10 = await Module.create(trackId, 'beginner', 'Strings', 'C-style strings', 'fundamentals', 5, 10);
  const b11 = await Module.create(trackId, 'beginner', 'Basic Pointers', 'Pointer fundamentals', 'fundamentals', 7, 11);
  const b12 = await Module.create(trackId, 'beginner', 'Structures', 'struct keyword and usage', 'fundamentals', 6, 12);
  const b13 = await Module.create(trackId, 'beginner', 'File Handling', 'File I/O operations', 'fundamentals', 6, 13);
  const b14 = await Module.create(trackId, 'beginner', 'Memory Basics', 'Stack vs heap', 'fundamentals', 6, 14);
  const b15 = await Module.create(trackId, 'beginner', 'Simple Programs', 'Console applications', 'projects', 10, 15);

  // ============ INTERMEDIATE LEVEL - 20 Modules ============
  const i1 = await Module.create(trackId, 'intermediate', 'Advanced Pointers', 'Double pointers, pointer arithmetic', 'fundamentals', 8, 1);
  const i2 = await Module.create(trackId, 'intermediate', 'Dynamic Memory Allocation', 'malloc, calloc, free, new, delete', 'fundamentals', 8, 2);
  const i3 = await Module.create(trackId, 'intermediate', 'Structures and Unions', 'Complex data structures', 'data-structures', 6, 3);
  const i4 = await Module.create(trackId, 'intermediate', 'Linked Lists', 'Singly, doubly linked lists', 'data-structures', 8, 4);
  const i5 = await Module.create(trackId, 'intermediate', 'Stacks', 'Stack implementation', 'data-structures', 6, 5);
  const i6 = await Module.create(trackId, 'intermediate', 'Queues', 'Queue implementation', 'data-structures', 6, 6);
  const i7 = await Module.create(trackId, 'intermediate', 'Trees', 'Binary trees, BST', 'data-structures', 10, 7);
  const i8 = await Module.create(trackId, 'intermediate', 'Sorting Algorithms', 'Bubble, merge, quick sort', 'algorithms', 8, 8);
  const i9 = await Module.create(trackId, 'intermediate', 'Searching Algorithms', 'Linear, binary search', 'algorithms', 6, 9);
  const i10 = await Module.create(trackId, 'intermediate', 'Time Complexity', 'Big O notation', 'algorithms', 6, 10);
  const i11 = await Module.create(trackId, 'intermediate', 'OOP Concepts in C++', 'Classes and objects', 'fundamentals', 8, 11);
  const i12 = await Module.create(trackId, 'intermediate', 'Classes and Objects', 'Class design in C++', 'fundamentals', 7, 12);
  const i13 = await Module.create(trackId, 'intermediate', 'Constructors', 'Default, parameterized, copy constructors', 'fundamentals', 6, 13);
  const i14 = await Module.create(trackId, 'intermediate', 'Inheritance', 'Single, multiple inheritance', 'fundamentals', 7, 14);
  const i15 = await Module.create(trackId, 'intermediate', 'Polymorphism', 'Virtual functions, overriding', 'fundamentals', 7, 15);
  const i16 = await Module.create(trackId, 'intermediate', 'Templates', 'Function and class templates', 'fundamentals', 8, 16);
  const i17 = await Module.create(trackId, 'intermediate', 'STL', 'Standard Template Library', 'data-structures', 10, 17);
  const i18 = await Module.create(trackId, 'intermediate', 'File Streams', 'fstream, ifstream, ofstream', 'fundamentals', 6, 18);
  const i19 = await Module.create(trackId, 'intermediate', 'Debugging Techniques', 'gdb and debugging tools', 'practice', 6, 19);
  const i20 = await Module.create(trackId, 'intermediate', 'Mini Project', 'Complete C++ application', 'projects', 20, 20);

  // ============ ADVANCED LEVEL - 15 Modules ============
  const a1 = await Module.create(trackId, 'advanced', 'Memory Optimization', 'Memory profiling and optimization', 'algorithms', 10, 1);
  const a2 = await Module.create(trackId, 'advanced', 'Advanced STL', 'Iterators, algorithms, functors', 'data-structures', 10, 2);
  const a3 = await Module.create(trackId, 'advanced', 'Multithreading', 'std::thread, mutex, condition variables', 'algorithms', 12, 3);
  const a4 = await Module.create(trackId, 'advanced', 'Low-Level Memory Management', 'Custom allocators', 'algorithms', 10, 4);
  const a5 = await Module.create(trackId, 'advanced', 'Operating System Concepts', 'Process, threads, scheduling', 'fundamentals', 10, 5);
  const a6 = await Module.create(trackId, 'advanced', 'Compiler Design Basics', 'Lexical analysis, parsing', 'algorithms', 12, 6);
  const a7 = await Module.create(trackId, 'advanced', 'Embedded Systems Basics', 'Microcontroller programming', 'fundamentals', 10, 7);
  const a8 = await Module.create(trackId, 'advanced', 'Networking Fundamentals', 'Sockets, TCP/IP', 'fundamentals', 10, 8);
  const a9 = await Module.create(trackId, 'advanced', 'Performance Optimization', 'Profiling and tuning', 'algorithms', 10, 9);
  const a10 = await Module.create(trackId, 'advanced', 'Real-Time Systems', 'RTOS concepts', 'algorithms', 10, 10);
  const a11 = await Module.create(trackId, 'advanced', 'Advanced Algorithms', 'Graph algorithms, dynamic programming', 'algorithms', 12, 11);
  const a12 = await Module.create(trackId, 'advanced', 'System Programming', 'System calls, IPC', 'fundamentals', 12, 12);
  const a13 = await Module.create(trackId, 'advanced', 'Kernel Concepts', 'Kernel modules, drivers', 'fundamentals', 12, 13);
  const a14 = await Module.create(trackId, 'advanced', 'Hardware Interaction', 'Direct hardware programming', 'fundamentals', 10, 14);
  const a15 = await Module.create(trackId, 'advanced', 'System-Level Capstone Project', 'Low-level system project', 'projects', 40, 15);

  // Prerequisites - Beginner (sequential)
  for (let i = 2; i <= 15; i++) {
    await Module.addPrerequisite(eval(`b${i}`), eval(`b${i - 1}`));
  }

  // Prerequisites - Intermediate (sequential)
  for (let i = 2; i <= 20; i++) {
    await Module.addPrerequisite(eval(`i${i}`), eval(`i${i - 1}`));
  }

  // Prerequisites - Advanced (sequential)
  for (let i = 2; i <= 15; i++) {
    await Module.addPrerequisite(eval(`a${i}`), eval(`a${i - 1}`));
  }
}

async function seedCloudModules(trackId, pythonTrackId) {
  // ============ BEGINNER LEVEL - 14 Modules ============
  const b1 = await Module.create(trackId, 'beginner', 'Introduction to Cloud Computing', 'Cloud fundamentals and benefits', 'fundamentals', 4, 1);
  const b2 = await Module.create(trackId, 'beginner', 'Types of Cloud Models', 'Public, private, hybrid cloud', 'fundamentals', 4, 2);
  const b3 = await Module.create(trackId, 'beginner', 'IaaS, PaaS, SaaS', 'Service models explained', 'fundamentals', 5, 3);
  const b4 = await Module.create(trackId, 'beginner', 'Virtualization Basics', 'Virtual machines and hypervisors', 'fundamentals', 5, 4);
  const b5 = await Module.create(trackId, 'beginner', 'Networking Fundamentals', 'IP, DNS, routing basics', 'fundamentals', 6, 5);
  const b6 = await Module.create(trackId, 'beginner', 'Cloud Storage Concepts', 'Block, object, file storage', 'fundamentals', 5, 6);
  const b7 = await Module.create(trackId, 'beginner', 'Compute Services', 'Virtual machines and instances', 'fundamentals', 5, 7);
  const b8 = await Module.create(trackId, 'beginner', 'AWS/Azure/GCP Overview', 'Major cloud providers', 'fundamentals', 6, 8);
  const b9 = await Module.create(trackId, 'beginner', 'Identity and Access Management', 'IAM, users, roles, policies', 'fundamentals', 6, 9);
  const b10 = await Module.create(trackId, 'beginner', 'Billing and Cost Concepts', 'Cloud pricing models', 'fundamentals', 4, 10);
  const b11 = await Module.create(trackId, 'beginner', 'Cloud Security Basics', 'Security fundamentals', 'fundamentals', 6, 11);
  const b12 = await Module.create(trackId, 'beginner', 'Monitoring and Logging', 'CloudWatch, logging basics', 'fundamentals', 5, 12);
  const b13 = await Module.create(trackId, 'beginner', 'CLI Basics', 'Command-line tools', 'practice', 5, 13);
  const b14 = await Module.create(trackId, 'beginner', 'Simple Cloud Application', 'Deploy first cloud app', 'projects', 12, 14);

  // ============ INTERMEDIATE LEVEL - 18 Modules ============
  const i1 = await Module.create(trackId, 'intermediate', 'Virtual Machines Deep Dive', 'Advanced VM management', 'fundamentals', 8, 1);
  const i2 = await Module.create(trackId, 'intermediate', 'Load Balancing', 'Distributing traffic', 'algorithms', 7, 2);
  const i3 = await Module.create(trackId, 'intermediate', 'Auto Scaling', 'Automatic resource scaling', 'algorithms', 7, 3);
  const i4 = await Module.create(trackId, 'intermediate', 'Cloud Databases', 'RDS, DynamoDB, managed databases', 'data-structures', 8, 4);
  const i5 = await Module.create(trackId, 'intermediate', 'Object Storage', 'S3, blob storage', 'data-structures', 6, 5);
  const i6 = await Module.create(trackId, 'intermediate', 'VPC Networking', 'Virtual private clouds', 'fundamentals', 8, 6);
  const i7 = await Module.create(trackId, 'intermediate', 'Containers Overview', 'Container concepts', 'fundamentals', 6, 7);
  const i8 = await Module.create(trackId, 'intermediate', 'Docker Fundamentals', 'Images, containers, Dockerfile', 'fundamentals', 10, 8);
  const i9 = await Module.create(trackId, 'intermediate', 'Kubernetes Basics', 'Pods, services, deployments', 'algorithms', 12, 9);
  const i10 = await Module.create(trackId, 'intermediate', 'CI/CD Pipelines', 'Continuous integration and deployment', 'practice', 10, 10);
  const i11 = await Module.create(trackId, 'intermediate', 'Infrastructure as Code', 'IaC principles', 'fundamentals', 8, 11);
  const i12 = await Module.create(trackId, 'intermediate', 'Terraform Basics', 'Terraform syntax and modules', 'fundamentals', 10, 12);
  const i13 = await Module.create(trackId, 'intermediate', 'Monitoring Tools', 'Prometheus, Grafana', 'practice', 7, 13);
  const i14 = await Module.create(trackId, 'intermediate', 'Logging Systems', 'ELK stack, centralized logging', 'fundamentals', 7, 14);
  const i15 = await Module.create(trackId, 'intermediate', 'Backup and Recovery', 'Disaster recovery planning', 'fundamentals', 6, 15);
  const i16 = await Module.create(trackId, 'intermediate', 'Cost Optimization', 'Cloud cost management', 'practice', 6, 16);
  const i17 = await Module.create(trackId, 'intermediate', 'Security Best Practices', 'Cloud security implementation', 'fundamentals', 8, 17);
  const i18 = await Module.create(trackId, 'intermediate', 'Intermediate Cloud Project', 'Multi-tier cloud application', 'projects', 25, 18);

  // ============ ADVANCED LEVEL - 15 Modules ============
  const a1 = await Module.create(trackId, 'advanced', 'Cloud Architecture Design', 'Well-architected framework', 'algorithms', 12, 1);
  const a2 = await Module.create(trackId, 'advanced', 'High Availability Systems', 'HA patterns and implementation', 'algorithms', 10, 2);
  const a3 = await Module.create(trackId, 'advanced', 'Disaster Recovery Strategies', 'RTO, RPO, backup strategies', 'algorithms', 10, 3);
  const a4 = await Module.create(trackId, 'advanced', 'Advanced Kubernetes', 'StatefulSets, operators, Helm', 'algorithms', 14, 4);
  const a5 = await Module.create(trackId, 'advanced', 'Service Mesh', 'Istio, Linkerd', 'algorithms', 12, 5);
  const a6 = await Module.create(trackId, 'advanced', 'Cloud Security Architecture', 'Zero trust implementation', 'algorithms', 12, 6);
  const a7 = await Module.create(trackId, 'advanced', 'Zero Trust Model', 'Zero trust principles', 'fundamentals', 8, 7);
  const a8 = await Module.create(trackId, 'advanced', 'Performance Optimization', 'Cloud performance tuning', 'algorithms', 10, 8);
  const a9 = await Module.create(trackId, 'advanced', 'Multi-Cloud Strategy', 'Managing multiple cloud providers', 'algorithms', 10, 9);
  const a10 = await Module.create(trackId, 'advanced', 'DevSecOps', 'Security in DevOps pipeline', 'practice', 10, 10);
  const a11 = await Module.create(trackId, 'advanced', 'Observability', 'Metrics, logs, traces', 'practice', 10, 11);
  const a12 = await Module.create(trackId, 'advanced', 'Compliance Standards', 'GDPR, HIPAA, SOC 2', 'fundamentals', 8, 12);
  const a13 = await Module.create(trackId, 'advanced', 'Cloud Automation', 'Advanced automation patterns', 'algorithms', 10, 13);
  const a14 = await Module.create(trackId, 'advanced', 'Enterprise Architecture Patterns', 'Microservices, event-driven', 'algorithms', 12, 14);
  const a15 = await Module.create(trackId, 'advanced', 'Enterprise Cloud Capstone Project', 'Production-grade cloud system', 'projects', 50, 15);

  // Prerequisites - Beginner (sequential)
  for (let i = 2; i <= 14; i++) {
    await Module.addPrerequisite(eval(`b${i}`), eval(`b${i - 1}`));
  }

  // Prerequisites - Intermediate (sequential)
  for (let i = 2; i <= 18; i++) {
    await Module.addPrerequisite(eval(`i${i}`), eval(`i${i - 1}`));
  }

  // Prerequisites - Advanced (sequential)
  for (let i = 2; i <= 15; i++) {
    await Module.addPrerequisite(eval(`a${i}`), eval(`a${i - 1}`));
  }

  // Seed sample videos
  await seedSampleVideos(pythonTrack.id);
  console.log('✓ Sample videos created');
}

// Seed sample videos for demonstration
async function seedSampleVideos(pythonTrackId) {
  // Get admin user (first user created)
  const adminUser = await db.get('SELECT id FROM users WHERE id = 1');
  const adminId = adminUser ? adminUser.id : 1;

  // Get some module IDs for linking
  const modules = await db.all('SELECT id, title FROM modules WHERE track_id = ? LIMIT 5', [pythonTrackId]);

  // Sample video 1: Beginner
  const video1Id = await Video.create(
    'Python Basics: Variables and Data Types',
    'Learn the fundamental building blocks of Python programming including variables, data types, and basic operations.',
    'https://www.youtube.com/watch?v=kqtD5dpn9C8', // Sample Python tutorial
    'https://img.youtube.com/vi/kqtD5dpn9C8/maxresdefault.jpg',
    720,
    'beginner',
    'python, basics, variables, data types',
    modules[0]?.id || null,
    adminId
  );

  await VideoNotes.create(video1Id, `
    <h2>Key Concepts</h2>
    <ul>
      <li><strong>Variables:</strong> Containers for storing data values</li>
      <li><strong>Data Types:</strong> int, float, string, boolean, list, dict</li>
      <li><strong>Type Conversion:</strong> Converting between different data types</li>
      <li><strong>Operators:</strong> Arithmetic, comparison, and logical operators</li>
    </ul>
    
    <h2>Code Examples</h2>
    <p>Variable assignment and type checking:</p>
    <pre>
name = "Alice"
age = 25
is_student = True
print(f"{name} is {age} years old")
    </pre>
    
    <h2>Best Practices</h2>
    <ul>
      <li>Use descriptive variable names</li>
      <li>Follow PEP 8 naming conventions</li>
      <li>Understand mutable vs immutable types</li>
    </ul>
  `, [
    { time: 0, title: 'Introduction', content: 'Overview of Python data types' },
    { time: 180, title: 'Variables', content: 'Creating and naming variables' },
    { time: 360, title: 'Data Types', content: 'Numbers, strings, booleans' },
    { time: 540, title: 'Type Conversion', content: 'Converting between types' }
  ]);

  // Sample video 2: Intermediate
  const video2Id = await Video.create(
    'FastAPI Fundamentals: Building REST APIs',
    'Build modern, fast REST APIs with FastAPI including path operations, request validation, and async endpoints.',
    'https://www.youtube.com/watch?v=0sOvCWFmrtA', // Sample FastAPI tutorial
    'https://img.youtube.com/vi/0sOvCWFmrtA/maxresdefault.jpg',
    1800,
    'intermediate',
    'fastapi, rest api, python, backend',
    modules[2]?.id || null,
    adminId
  );

  await VideoNotes.create(video2Id, `
    <h2>FastAPI Overview</h2>
    <p>FastAPI is a modern, fast web framework for building APIs with Python based on standard Python type hints.</p>
    
    <h2>Key Features</h2>
    <ul>
      <li><strong>Fast:</strong> Very high performance, on par with NodeJS and Go</li>
      <li><strong>Type Hints:</strong> Automatic request validation using Python type hints</li>
      <li><strong>Auto Documentation:</strong> Interactive API docs with Swagger UI</li>
      <li><strong>Async Support:</strong> Native support for async/await</li>
    </ul>
    
    <h2>Basic API Example</h2>
    <pre>
from fastapi import FastAPI

app = FastAPI()

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}
    </pre>
    
    <h2>Path Operations</h2>
    <ul>
      <li>GET, POST, PUT, DELETE operations</li>
      <li>Path parameters and query parameters</li>
      <li>Request body validation with Pydantic</li>
      <li>Response models and status codes</li>
    </ul>
  `, [
    { time: 0, title: 'FastAPI Introduction', content: 'What is FastAPI and why use it' },
    { time: 300, title: 'First API', content: 'Creating your first endpoint' },
    { time: 900, title: 'Path Operations', content: 'GET, POST, PUT, DELETE' },
    { time: 1200, title: 'Validation', content: 'Request validation with Pydantic' },
    { time: 1500, title: 'Async Endpoints', content: 'Using async/await in FastAPI' }
  ]);

  // Sample video 3: Advanced
  const video3Id = await Video.create(
    'Docker for Python Applications',
    'Containerize Python applications with Docker, create multi-stage builds, and optimize images for production deployment.',
    'https://www.youtube.com/watch?v=bi0cKgmRuiA', // Sample Docker tutorial
    'https://img.youtube.com/vi/bi0cKgmRuiA/maxresdefault.jpg',
    2400,
    'advanced',
    'docker, containers, deployment, devops',
    modules[4]?.id || null,
    adminId
  );

  await VideoNotes.create(video3Id, `
    <h2>Docker Essentials</h2>
    <p>Docker enables you to package applications with all dependencies into standardized containers.</p>
    
    <h2>Key Concepts</h2>
    <ul>
      <li><strong>Images:</strong> Read-only templates for creating containers</li>
      <li><strong>Containers:</strong> Runnable instances of images</li>
      <li><strong>Dockerfile:</strong> Script to build custom images</li>
      <li><strong>Docker Compose:</strong> Multi-container orchestration</li>
    </ul>
    
    <h2>Python Dockerfile Example</h2>
    <pre>
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
    </pre>
    
    <h2>Multi-Stage Builds</h2>
    <p>Optimize image size by using multi-stage builds that separate build dependencies from runtime.</p>
    
    <h2>Best Practices</h2>
    <ul>
      <li>Use specific base image versions</li>
      <li>Minimize layers with combined RUN commands</li>
      <li>Use .dockerignore to exclude unnecessary files</li>
      <li>Don't run containers as root</li>
      <li>Health checks for production deployments</li>
    </ul>
  `, [
    { time: 0, title: 'Docker Overview', content: 'Introduction to containerization' },
    { time: 480, title: 'Dockerfile Basics', content: 'Writing your first Dockerfile' },
    { time: 960, title: 'Building Images', content: 'Docker build process and caching' },
    { time: 1440, title: 'Multi-Stage Builds', content: 'Optimizing image size' },
    { time: 1920, title: 'Production Tips', content: 'Security and best practices' }
  ]);

  return 3; // Number of videos created
}

// Run if called directly
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seedData;
