import crypto from 'crypto';

// Auto-generate a secure JWT secret if not provided
const generateJwtSecret = (): string => {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) {
    return process.env.JWT_SECRET;
  }
  
  // Generate a cryptographically secure random secret
  const secret = crypto.randomBytes(64).toString('hex');
  console.log('ℹ️ Auto-generated JWT secret (store this in .env for persistence)');
  return secret;
};

export const config = {
  database: {
    url: process.env.DATABASE_URL!,
  },
  jwtSecret: generateJwtSecret(),
  jwt: {
    secret: generateJwtSecret(),
    expiresIn: '7d'
  },
  port: parseInt(process.env.PORT || '5000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

// Validate required environment variables (only DATABASE_URL is critical)
if (!process.env.DATABASE_URL) {
  throw new Error('Missing required environment variable: DATABASE_URL');
}