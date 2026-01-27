const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

async function verifyModules() {
  console.log('=== Module Count Verification ===\n');

  const tracks = ['Java', 'Python', 'C/C++', 'Cloud Computing'];
  const levels = ['beginner', 'intermediate', 'advanced'];

  for (const track of tracks) {
    console.log(`Track: ${track}`);
    for (const level of levels) {
      const count = await new Promise((resolve, reject) => {
        db.get(
          `SELECT COUNT(*) as count FROM modules m 
           JOIN tracks t ON m.track_id = t.id 
           WHERE t.name = ? AND m.level = ?`,
          [track, level],
          (err, row) => {
            if (err) reject(err);
            else resolve(row.count);
          }
        );
      });
      console.log(`  ${level}: ${count} modules`);
    }
    console.log('');
  }

  db.close();
}

verifyModules().catch(console.error);
