// server/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'admin' | 'staff' | 'student';
  full_name?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If running in development without auth header, provide default demo admin user for easy testing
    if (process.env.NODE_ENV !== 'production') {
      req.user = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'admin@campus-eco.edu',
        role: 'admin',
        full_name: 'Campus System Admin',
      };
      next();
      return;
    }
    res.status(401).json({ error: 'Unauthorized: Authorization Bearer token is required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  // Support local development mock tokens
  if (token.startsWith('dev-')) {
    const role = token.includes('student') ? 'student' : token.includes('staff') ? 'staff' : 'admin';
    req.user = {
      id: role === 'student' ? '11111111-1111-1111-1111-111111111111' : '00000000-0000-0000-0000-000000000001',
      email: `${role}@campus-eco.edu`,
      role: role as 'admin' | 'staff' | 'student',
      full_name: `${role.toUpperCase()} Demo User`,
    };
    next();
    return;
  }

  if (!isSupabaseConfigured) {
    // Safe mock fallback for non-configured Supabase environments
    req.user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@campus-eco.edu',
      role: 'admin',
      full_name: 'Campus Sustainability Admin',
    };
    next();
    return;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired session token' });
      return;
    }

    // Query profile for assigned role
    let { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single();

    // If profile doesn't exist yet (e.g. first Google OAuth login, trigger may lag),
    // upsert it now so subsequent requests work correctly.
    if (!profile) {
      const full_name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'Campus User';

      const { data: upserted } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email || '',
          full_name,
          role: user.user_metadata?.role || 'student',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          department: user.user_metadata?.department || 'Campus Community',
        }, { onConflict: 'id' })
        .select('role, full_name')
        .single();

      profile = upserted;
    }

    req.user = {
      id: user.id,
      email: user.email || 'user@campus-eco.edu',
      role: (profile?.role as 'admin' | 'staff' | 'student') || (user.user_metadata?.role as any) || 'student',
      full_name: profile?.full_name || user.user_metadata?.full_name || 'Campus User',
    };

    next();
  } catch (err: any) {
    console.error('[Auth Middleware] Verification failed:', err.message);
    res.status(401).json({ error: 'Token verification failed' });
  }
};

export const requireStaffOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized: Authentication required' });
    return;
  }

  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    res.status(403).json({ error: 'Forbidden: Requires staff or administrator privileges' });
    return;
  }

  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized: Authentication required' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: Requires administrator privileges' });
    return;
  }

  next();
};
