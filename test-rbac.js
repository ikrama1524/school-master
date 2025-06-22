// Test script to verify role-based access control
const bcrypt = require('bcryptjs');

async function createTestUser() {
  const hashedPassword = await bcrypt.hash('test123', 10);
  console.log('Hashed password for test student:', hashedPassword);
}

createTestUser();