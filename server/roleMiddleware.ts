import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { hasModuleAccess, ACCESS_LEVELS, MODULES } from './roles';

// Extend Request interface to include user and permissions
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
        role: string;
      };
      userPermissions?: any;
    }
  }
}

// Middleware to verify JWT token and extract user info
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      message: 'Access token required',
      error: 'MISSING_TOKEN' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'school_management_super_secret_key_2025_change_in_production') as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      message: 'Invalid or expired token',
      error: 'INVALID_TOKEN' 
    });
  }
}

// Middleware factory to check role-based access to modules
export function requireModuleAccess(module: string, accessLevel: string = ACCESS_LEVELS.READ) {
  return (req: Request, res: Response, next: NextFunction) => {
    // First ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED' 
      });
    }

    const userRole = req.user.role;
    
    // Check if user has required access to the module
    if (!hasModuleAccess(userRole, module, accessLevel)) {
      return res.status(403).json({ 
        message: `Access denied. Required: ${accessLevel} access to ${module} module`,
        error: 'INSUFFICIENT_PERMISSIONS',
        userRole,
        requiredModule: module,
        requiredAccess: accessLevel
      });
    }

    next();
  };
}

// Middleware to check specific roles (more granular control)
export function requireRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED' 
      });
    }

    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        error: 'INSUFFICIENT_ROLE',
        userRole,
        allowedRoles
      });
    }

    next();
  };
}

// Middleware to check multiple access levels (OR condition)
export function requireAnyModuleAccess(module: string, ...accessLevels: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED' 
      });
    }

    const userRole = req.user.role;
    
    // Check if user has any of the required access levels
    const hasAccess = accessLevels.some(level => hasModuleAccess(userRole, module, level));
    
    if (!hasAccess) {
      return res.status(403).json({ 
        message: `Access denied. Required: one of [${accessLevels.join(', ')}] access to ${module} module`,
        error: 'INSUFFICIENT_PERMISSIONS',
        userRole,
        requiredModule: module,
        requiredAccess: accessLevels
      });
    }

    next();
  };
}

// Middleware to get user permissions (useful for frontend)
export function getUserPermissions(req: Request, res: Response, next: NextFunction) {
  if (req.user) {
    const userRole = req.user.role;
    const permissions = {};
    
    // Check access for all modules
    Object.values(MODULES).forEach(module => {
      permissions[module] = {
        read: hasModuleAccess(userRole, module, ACCESS_LEVELS.READ),
        write: hasModuleAccess(userRole, module, ACCESS_LEVELS.WRITE),
        admin: hasModuleAccess(userRole, module, ACCESS_LEVELS.ADMIN)
      };
    });
    
    req.userPermissions = permissions;
  }
  
  next();
}

export default {
  authenticateToken,
  requireModuleAccess,
  requireRoles,
  requireAnyModuleAccess,
  getUserPermissions
};