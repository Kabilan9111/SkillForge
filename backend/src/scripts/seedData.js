const db = require('../config/database');
const Institution = require('../models/Institution');
const User = require('../models/User');
const Track = require('../models/Track');
const Module = require('../models/Module');

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
    await seedCloudModules(cloudTrack.id);
    console.log('✓ Cloud Computing modules created');

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
    await Module.addPrerequisite(eval(`b${i}`), eval(`b${i-1}`));
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
    await Module.addPrerequisite(eval(`a${i}`), eval(`a${i-1}`));
  }
}

async function seedPythonFullStackModules(trackId) {
  // ============ BEGINNER LEVEL - 18 Modules ============
  const b1 = await Module.create(trackId, 'beginner', 'Introduction to Programming and Python', 'Programming fundamentals and Python overview', 'fundamentals', 4, 1);
  const b2 = await Module.create(trackId, 'beginner', 'Python Installation and IDE Setup', 'Setting up development environment', 'fundamentals', 3, 2);
  const b3 = await Module.create(trackId, 'beginner', 'Python Syntax and Indentation Rules', 'Understanding Python syntax', 'fundamentals', 4, 3);
  const b4 = await Module.create(trackId, 'beginner', 'Variables and Data Types', 'Numbers, strings, booleans', 'fundamentals', 4, 4);
  const b5 = await Module.create(trackId, 'beginner', 'Input and Output Operations', 'User interaction basics', 'fundamentals', 3, 5);
  const b6 = await Module.create(trackId, 'beginner', 'Arithmetic, Relational, and Logical Operators', 'Operators and expressions', 'fundamentals', 4, 6);
  const b7 = await Module.create(trackId, 'beginner', 'Conditional Statements (if, elif, else)', 'Control flow basics', 'fundamentals', 5, 7);
  const b8 = await Module.create(trackId, 'beginner', 'Looping Constructs (for, while)', 'Iteration fundamentals', 'fundamentals', 5, 8);
  const b9 = await Module.create(trackId, 'beginner', 'Loop Control Statements (break, continue, pass)', 'Advanced loop control', 'fundamentals', 4, 9);
  const b10 = await Module.create(trackId, 'beginner', 'Strings and String Operations', 'String manipulation', 'fundamentals', 5, 10);
  const b11 = await Module.create(trackId, 'beginner', 'Lists and List Operations', 'Working with lists', 'data-structures', 6, 11);
  const b12 = await Module.create(trackId, 'beginner', 'Tuples and Sets', 'Immutable and unique collections', 'data-structures', 5, 12);
  const b13 = await Module.create(trackId, 'beginner', 'Dictionaries and Key-Value Operations', 'Hash maps in Python', 'data-structures', 6, 13);
  const b14 = await Module.create(trackId, 'beginner', 'Basic Functions', 'Function definition and calling', 'fundamentals', 5, 14);
  const b15 = await Module.create(trackId, 'beginner', 'Function Arguments and Return Values', 'Parameters and return statements', 'fundamentals', 5, 15);
  const b16 = await Module.create(trackId, 'beginner', 'Basic Error Handling', 'Try-except basics', 'fundamentals', 4, 16);
  const b17 = await Module.create(trackId, 'beginner', 'Writing Simple Programs', 'Building console applications', 'practice', 6, 17);
  const b18 = await Module.create(trackId, 'beginner', 'Beginner-Level Mini Tasks', 'Practice exercises and challenges', 'projects', 10, 18);

  // ============ INTERMEDIATE LEVEL - 30 Modules ============
  const i1 = await Module.create(trackId, 'intermediate', 'Advanced Functions', 'Nested functions, closures', 'fundamentals', 6, 1);
  const i2 = await Module.create(trackId, 'intermediate', 'Lambda Functions', 'Anonymous functions', 'fundamentals', 5, 2);
  const i3 = await Module.create(trackId, 'intermediate', 'Recursion Concepts', 'Recursive problem solving', 'algorithms', 6, 3);
  const i4 = await Module.create(trackId, 'intermediate', 'Modules and Packages', 'Code organization', 'fundamentals', 5, 4);
  const i5 = await Module.create(trackId, 'intermediate', 'Virtual Environments', 'Managing dependencies', 'fundamentals', 4, 5);
  const i6 = await Module.create(trackId, 'intermediate', 'File Handling (Text and Binary)', 'File operations', 'fundamentals', 6, 6);
  const i7 = await Module.create(trackId, 'intermediate', 'Exception Handling Deep Dive', 'Advanced error handling', 'fundamentals', 6, 7);
  const i8 = await Module.create(trackId, 'intermediate', 'Object-Oriented Programming Concepts', 'OOP principles', 'fundamentals', 7, 8);
  const i9 = await Module.create(trackId, 'intermediate', 'Classes and Objects', 'Creating classes', 'fundamentals', 6, 9);
  const i10 = await Module.create(trackId, 'intermediate', 'Constructors and Destructors', '__init__ and __del__', 'fundamentals', 5, 10);
  const i11 = await Module.create(trackId, 'intermediate', 'Inheritance', 'Class inheritance', 'fundamentals', 6, 11);
  const i12 = await Module.create(trackId, 'intermediate', 'Polymorphism', 'Method overriding', 'fundamentals', 6, 12);
  const i13 = await Module.create(trackId, 'intermediate', 'Encapsulation', 'Data hiding', 'fundamentals', 5, 13);
  const i14 = await Module.create(trackId, 'intermediate', 'Abstraction', 'Abstract classes', 'fundamentals', 5, 14);
  const i15 = await Module.create(trackId, 'intermediate', 'Python Standard Library Overview', 'Built-in modules', 'fundamentals', 6, 15);
  const i16 = await Module.create(trackId, 'intermediate', 'Date and Time Handling', 'datetime module', 'fundamentals', 4, 16);
  const i17 = await Module.create(trackId, 'intermediate', 'Regular Expressions', 'Pattern matching', 'algorithms', 6, 17);
  const i18 = await Module.create(trackId, 'intermediate', 'Iterators and Generators', 'Lazy evaluation', 'algorithms', 6, 18);
  const i19 = await Module.create(trackId, 'intermediate', 'Decorators', 'Function modification', 'algorithms', 6, 19);
  const i20 = await Module.create(trackId, 'intermediate', 'JSON and CSV Handling', 'Data formats', 'fundamentals', 5, 20);
  const i21 = await Module.create(trackId, 'intermediate', 'Debugging Techniques', 'Debugging tools', 'practice', 5, 21);
  const i22 = await Module.create(trackId, 'intermediate', 'Logging Mechanisms', 'Logging framework', 'fundamentals', 5, 22);
  const i23 = await Module.create(trackId, 'intermediate', 'Unit Testing Basics', 'unittest and pytest', 'practice', 6, 23);
  const i24 = await Module.create(trackId, 'intermediate', 'Command Line Applications', 'CLI development', 'practice', 6, 24);
  const i25 = await Module.create(trackId, 'intermediate', 'Data Structures Introduction', 'Advanced structures', 'data-structures', 6, 25);
  const i26 = await Module.create(trackId, 'intermediate', 'Stacks', 'LIFO data structure', 'data-structures', 5, 26);
  const i27 = await Module.create(trackId, 'intermediate', 'Queues', 'FIFO data structure', 'data-structures', 5, 27);
  const i28 = await Module.create(trackId, 'intermediate', 'Linked Lists', 'Node-based structures', 'data-structures', 6, 28);
  const i29 = await Module.create(trackId, 'intermediate', 'Searching Algorithms', 'Linear and binary search', 'algorithms', 6, 29);
  const i30 = await Module.create(trackId, 'intermediate', 'Console-Based Project', 'Complete CLI application', 'projects', 20, 30);

  // ============ ADVANCED LEVEL - 20 Modules ============
  const a1 = await Module.create(trackId, 'advanced', 'Advanced OOP Design Patterns', 'Design pattern implementation', 'algorithms', 10, 1);
  const a2 = await Module.create(trackId, 'advanced', 'Memory Management in Python', 'Reference counting, garbage collection', 'algorithms', 7, 2);
  const a3 = await Module.create(trackId, 'advanced', 'Multithreading', 'Threading module', 'algorithms', 8, 3);
  const a4 = await Module.create(trackId, 'advanced', 'Multiprocessing', 'Process-based parallelism', 'algorithms', 8, 4);
  const a5 = await Module.create(trackId, 'advanced', 'AsyncIO and Concurrency', 'Asynchronous programming', 'algorithms', 10, 5);
  const a6 = await Module.create(trackId, 'advanced', 'Performance Optimization', 'Code profiling and optimization', 'algorithms', 8, 6);
  const a7 = await Module.create(trackId, 'advanced', 'Profiling and Benchmarking', 'Performance measurement', 'practice', 6, 7);
  const a8 = await Module.create(trackId, 'advanced', 'Advanced Exception Design', 'Custom exception hierarchies', 'fundamentals', 5, 8);
  const a9 = await Module.create(trackId, 'advanced', 'File System Internals', 'OS-level file operations', 'fundamentals', 6, 9);
  const a10 = await Module.create(trackId, 'advanced', 'Networking Fundamentals', 'Sockets and protocols', 'fundamentals', 8, 10);
  const a11 = await Module.create(trackId, 'advanced', 'REST APIs with FastAPI', 'Modern API development', 'projects', 12, 11);
  const a12 = await Module.create(trackId, 'advanced', 'API Authentication and Authorization', 'Security implementation', 'algorithms', 8, 12);
  const a13 = await Module.create(trackId, 'advanced', 'Database Integration', 'Database connectivity', 'data-structures', 8, 13);
  const a14 = await Module.create(trackId, 'advanced', 'ORM Concepts', 'Object-relational mapping', 'data-structures', 7, 14);
  const a15 = await Module.create(trackId, 'advanced', 'SQLAlchemy Deep Dive', 'Advanced ORM usage', 'data-structures', 10, 15);
  const a16 = await Module.create(trackId, 'advanced', 'Caching Strategies', 'Redis and caching patterns', 'algorithms', 8, 16);
  const a17 = await Module.create(trackId, 'advanced', 'Advanced Testing for APIs', 'Integration and end-to-end testing', 'practice', 8, 17);
  const a18 = await Module.create(trackId, 'advanced', 'Security Best Practices', 'Application security', 'fundamentals', 7, 18);
  const a19 = await Module.create(trackId, 'advanced', 'Deployment Fundamentals', 'Production deployment', 'practice', 8, 19);
  const a20 = await Module.create(trackId, 'advanced', 'Capstone API Project', 'Full production API system', 'projects', 40, 20);

  // Prerequisites - Beginner (sequential)
  for (let i = 2; i <= 18; i++) {
    await Module.addPrerequisite(eval(`b${i}`), eval(`b${i-1}`));
  }

  // Prerequisites - Intermediate (mostly sequential)
  for (let i = 2; i <= 30; i++) {
    await Module.addPrerequisite(eval(`i${i}`), eval(`i${i-1}`));
  }

  // Prerequisites - Advanced (sequential)
  for (let i = 2; i <= 20; i++) {
    await Module.addPrerequisite(eval(`a${i}`), eval(`a${i-1}`));
  }
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
    await Module.addPrerequisite(eval(`b${i}`), eval(`b${i-1}`));
  }

  // Prerequisites - Intermediate (sequential)
  for (let i = 2; i <= 20; i++) {
    await Module.addPrerequisite(eval(`i${i}`), eval(`i${i-1}`));
  }

  // Prerequisites - Advanced (sequential)
  for (let i = 2; i <= 15; i++) {
    await Module.addPrerequisite(eval(`a${i}`), eval(`a${i-1}`));
  }
}

async function seedCloudModules(trackId) {
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
    await Module.addPrerequisite(eval(`b${i}`), eval(`b${i-1}`));
  }

  // Prerequisites - Intermediate (sequential)
  for (let i = 2; i <= 18; i++) {
    await Module.addPrerequisite(eval(`i${i}`), eval(`i${i-1}`));
  }

  // Prerequisites - Advanced (sequential)
  for (let i = 2; i <= 15; i++) {
    await Module.addPrerequisite(eval(`a${i}`), eval(`a${i-1}`));
  }
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
