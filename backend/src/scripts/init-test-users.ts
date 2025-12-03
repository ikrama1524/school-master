
import { db } from '../config/database.js';
import { users } from '../schemas/index.js';
import bcrypt from 'bcryptjs';

const testUsers = [
  { username: 'admin', password: 'admin123', fullName: 'Admin User', role: 'admin', email: 'admin@school.com' },
  { username: 'principal', password: 'principal123', fullName: 'Principal User', role: 'principal', email: 'principal@school.com' },
  { username: 'teacher', password: 'teacher123', fullName: 'Class Teacher', role: 'class_teacher', email: 'teacher@school.com' },
  { username: 'student', password: 'student123', fullName: 'Student User', role: 'student_parent', email: 'student@school.com' }
];

async function createTestUsers() {
  console.log('Creating test users...');
  
  for (const userData of testUsers) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      await db.insert(users).values({
        ...userData,
        password: hashedPassword
      }).onConflictDoNothing();
      console.log(`✓ Created user: ${userData.username}`);
    } catch (error) {
      console.log(`✗ User ${userData.username} may already exist`);
    }
  }
  
  console.log('\nTest credentials:');
  testUsers.forEach(u => console.log(`${u.role}: ${u.username} / ${u.password}`));
}

createTestUsers().then(() => process.exit(0)).catch(console.error);
