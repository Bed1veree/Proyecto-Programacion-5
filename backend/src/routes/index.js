import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import bookRoutes from './books.js';
import userRoutes from './users.js';
import categoryRoutes from './categories.js';
import authRoutes from './auth.js';
import loanRoutes from './loans.js';
import loanRequestRoutes from './loanRequests.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'La API de BiblioUni está funcionando',
    timestamp: new Date().toISOString(),
  });
});

router.get('/info', (req, res) => {
  res.json({
    name: 'BiblioUni',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/health',
      info: '/api/info',
      books: '/api/books',
      users: '/api/users',
      categories: '/api/categories',
      loans: '/api/loans',
      admin: '/api/admin',
    },
  });
});

router.use('/books', bookRoutes);

router.use('/categories', categoryRoutes);

router.use('/users', userRoutes);

router.use('/auth', authRoutes);

router.use('/loans', authMiddleware, loanRoutes);
router.use('/loan-requests', loanRequestRoutes);

export default router;
