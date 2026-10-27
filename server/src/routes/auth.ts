// server/src/routes/auth.ts
import { Router, Request, Response } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

const router = Router();

// Demo users table in memory
interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'staff' | 'student';
  department: string;
  created_at: string;
}

const mockProfiles: UserProfile[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@campus-eco.edu',
    full_name: 'Dr. Evelyn Vance',
    role: 'admin',
    department: 'Facilities & Campus Sustainability Operations',
    created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'staff@campus-eco.edu',
    full_name: 'Carlos Mendez',
    role: 'staff',
    department: 'Plumbing & Grounds Maintenance',
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'student@campus-eco.edu',
    full_name: 'Alex Chen',
    role: 'student',
    department: 'Computer Science & Engineering',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];

// POST sync user with profile
router.post('/sync', authenticateToken, async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: 'User context not found' });
    return;
  }

  let profile = mockProfiles.find(p => p.id === user.id);
  if (!profile) {
    profile = {
      id: user.id,
      email: user.email,
      full_name: user.full_name || 'Campus Member',
      role: user.role || 'student',
      department: 'Campus Community',
      created_at: new Date().toISOString(),
    };
    mockProfiles.push(profile);
  }

  res.json({
    message: 'User synchronized successfully',
    profile,
  });
});

// POST login with email and password
router.post('/login', async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  if (!email) {
    res.status(400).json({ error: 'Email address is required' });
    return;
  }

  // Check if matches known mock profiles
  let user = mockProfiles.find(p => p.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // If custom email, generate or assign user profile based on role or email prefix
    const assignedRole: 'admin' | 'staff' | 'student' =
      (role === 'admin' || role === 'staff' || role === 'student')
        ? role
        : (email.includes('admin') ? 'admin' : email.includes('staff') ? 'staff' : 'student');
    const namePart = email.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    user = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      email: email,
      full_name: formattedName || 'Campus Member',
      role: assignedRole,
      department: assignedRole === 'admin' ? 'Campus Administration' : assignedRole === 'staff' ? 'Facilities Operations' : 'Student Body',
      created_at: new Date().toISOString()
    };
    mockProfiles.push(user);
  } else if (role && (role === 'admin' || role === 'staff' || role === 'student')) {
    user.role = role;
  }

  const token = `auth-${user.role}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  res.json({
    message: `Authenticated successfully as ${user.full_name}`,
    token,
    user
  });
});

// POST demo role switch (enables easy demonstration of all 3 roles)
router.post('/demo-login', async (req: Request, res: Response) => {
  const { role } = req.body;
  const targetRole = role === 'admin' ? 'admin' : role === 'staff' ? 'staff' : 'student';

  const user = mockProfiles.find(p => p.role === targetRole) || mockProfiles[0];
  const token = `dev-${targetRole}-token-${Date.now()}`;

  res.json({
    message: `Logged in as ${targetRole.toUpperCase()}`,
    token,
    user,
  });
});

// GET all users (Admin only)
router.get('/users', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data) {
        res.json({ users: data });
        return;
      }
    } catch (e) {
      console.warn('Supabase query error, using local profiles');
    }
  }
  res.json({ users: mockProfiles });
});

// PATCH update user role (Admin only)
router.patch('/users/:userId/role', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!['admin', 'staff', 'student'].includes(role)) {
    res.status(400).json({ error: 'Role must be admin, staff, or student' });
    return;
  }

  const profile = mockProfiles.find(p => p.id === userId);
  if (profile) {
    profile.role = role;
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('profiles').update({ role }).eq('id', userId);
    } catch (err) {
      console.error('Failed to update role in Supabase:', err);
    }
  }

  res.json({
    message: `User role updated to ${role}`,
    profile,
  });
});

export default router;
