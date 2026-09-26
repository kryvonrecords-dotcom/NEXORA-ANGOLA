import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { User } from '../src/types';

const JWT_SECRET = process.env.JWT_SECRET || 'nexora-news-super-secure-session-secret-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Acesso não autorizado. Faça login como administrador.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded || !decoded.id || decoded.role !== 'admin') {
    res.status(403).json({ error: 'Sessão inválida ou expirada. Permissão negada.' });
    return;
  }

  const user = db.getUserById(decoded.id);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Utilizador administrativo não encontrado.' });
    return;
  }

  req.user = user;
  next();
}
