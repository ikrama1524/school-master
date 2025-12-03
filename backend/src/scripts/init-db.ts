import { db } from '../config/database.js';
import { users } from '../schemas/index.js';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

const testUsers = [
  { username: 'admin', password: 'admin123', name: 'Super Admin', role: 'super_admin', email: 'admin@school.com' },
  { username: 'principal', password: 'principal123', name: 'Dr. Principal', role: 'principal', email: 'principal@school.com' },
  { username: 'teacher', password: 'teacher123', name: 'Class Teacher', role: 'class_teacher', email: 'teacher@school.com' },
  { username: 'subject_teacher', password: 'subject123', name: 'Subject Teacher', role: 'subject_teacher', email: 'subject@school.com' },
  { username: 'accountant', password: 'accountant123', name: 'Accountant', role: 'accountant', email: 'accountant@school.com' },
  { username: 'student', password: 'student123', name: 'Student User', role: 'student_parent', email: 'student@school.com' },
  { username: 'staff', password: 'staff123', name: 'Staff Member', role: 'non_teaching', email: 'staff@school.com' },
];

async function initializeDatabase() {
  console.log('🚀 Initializing database with test users...\n');

  for (const userData of testUsers) {
    try {
      const existing = await db.select().from(users).where(eq(users.username, userData.username));
      
      if (existing.length === 0) {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        await db.insert(users).values({
          username: userData.username,
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
          email: userData.email,
          isActive: true,
        });
        console.log(`✅ Created user: ${userData.username} (${userData.role})`);
      } else {
        console.log(`⏭️ User already exists: ${userData.username}`);
      }
    } catch (error) {
      console.error(`❌ Failed to create user ${userData.username}:`, error);
    }
  }

  console.log('\n📋 Test Credentials:');
  console.log('━'.repeat(50));
  testUsers.forEach(u => {
    console.log(`  ${u.role.padEnd(20)} → ${u.username} / ${u.password}`);
  });
  console.log('━'.repeat(50));
  console.log('\n✅ Database initialization complete!');
  process.exit(0);
}

initializeDatabase().catch(console.error);
