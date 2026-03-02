/**
 * Generate Test JWT Token for Development
 * Run: node backend/generateTestToken.js
 */

const jwt = require('jsonwebtoken');
const path = require('path');

// Load config
const configPath = path.join(__dirname, 'src', 'config', 'config.js');
let config;

try {
    config = require(configPath);
    console.log('✅ Loaded config from:', configPath);
} catch (error) {
    console.log('⚠️ Could not load config, using defaults');
    config = {
        jwt: {
            secret: 'dev-secret-key-change-this-in-production',
            expiresIn: '7d'
        }
    };
}

// Test user data
const testUsers = [
    {
        userId: 1,
        email: 'test@skillforge.com',
        role: 'user',
        institutionId: 1
    },
    {
        userId: 2,
        email: 'admin@skillforge.com',
        role: 'admin',
        institutionId: 1
    },
    {
        userId: 3,
        email: 'student@skillforge.com',
        role: 'student',
        institutionId: 2
    }
];

console.log('\n========================================');
console.log('🔐 JWT TEST TOKEN GENERATOR');
console.log('========================================\n');

console.log('📋 Using JWT Secret:', config.jwt.secret.substring(0, 20) + '...');
console.log('⏰ Token Expires In:', config.jwt.expiresIn);
console.log('\n');

testUsers.forEach((user, index) => {
    const token = jwt.sign(user, config.jwt.secret, { 
        expiresIn: config.jwt.expiresIn 
    });
    
    // Decode to show expiration
    const decoded = jwt.decode(token);
    const expiresAt = new Date(decoded.exp * 1000);
    
    console.log(`─────────────────────────────────────────`);
    console.log(`👤 Test User #${index + 1}:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   User ID: ${user.userId}`);
    console.log(`   Expires: ${expiresAt.toLocaleString()}`);
    console.log('');
    console.log('🔑 TOKEN:');
    console.log(token);
    console.log('');
    console.log('📋 Copy-paste to browser console:');
    console.log(`localStorage.setItem('authToken', '${token}');`);
    console.log('');
});

console.log(`─────────────────────────────────────────`);
console.log('\n✅ To use in frontend:\n');
console.log('1. Open browser DevTools (F12)');
console.log('2. Go to Console tab');
console.log('3. Paste one of the localStorage.setItem commands above');
console.log('4. Press Enter');
console.log('5. Refresh the page');
console.log('6. Try the AI analysis again!');
console.log('\n========================================\n');

// Verify tokens work
console.log('🔍 Verifying tokens...\n');
testUsers.forEach((user, index) => {
    const token = jwt.sign(user, config.jwt.secret, { 
        expiresIn: config.jwt.expiresIn 
    });
    
    try {
        const verified = jwt.verify(token, config.jwt.secret);
        console.log(`✅ Token #${index + 1} (${user.email}): Valid`);
    } catch (error) {
        console.log(`❌ Token #${index + 1} (${user.email}): Invalid - ${error.message}`);
    }
});

console.log('\n========================================\n');
