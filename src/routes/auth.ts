import { Router } from 'express';
import {
  register,
  login,
  adminLogin,
  getProfile,
  updateProfile,
  registerValidation,
  loginValidation,
} from '@/controllers/authController';
import { authenticateUser } from '@/middlewares/auth';

const router = Router();

// Rotas de autenticação
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/admin/login', loginValidation, adminLogin);
router.get('/me', authenticateUser, getProfile);
router.put('/me', authenticateUser, updateProfile);

export default router; 