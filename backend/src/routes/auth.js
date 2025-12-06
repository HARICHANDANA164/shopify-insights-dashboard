import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { sendPasswordResetEmail } from '../services/emailService.js';

const router = express.Router();
const prisma = new PrismaClient();

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, tenantName } = req.body;

    if (!email || !password || !tenantName) {
      return res.status(400).json({ error: 'Missing required fields: email, password, tenantName' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create tenant and user
    const tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        shopDomain: `${tenantName.toLowerCase().replace(/\s+/g, '-')}.myshopify.com`,
        users: {
          create: {
            email,
            password: hashedPassword,
            role: 'admin'
          }
        }
      },
      include: {
        users: true
      }
    });

    const user = tenant.users[0];

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({ error: 'Server configuration error. Please contact support.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, tenantId: tenant.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        shopDomain: tenant.shopDomain
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Provide more specific error messages
    if (error.code === 'P2002') {
      // Prisma unique constraint violation
      return res.status(400).json({ error: 'Email or tenant name already exists' });
    }
    
    if (error.name === 'PrismaClientKnownRequestError') {
      return res.status(500).json({ error: 'Database error. Please check your database connection.' });
    }
    
    // Include error message in response for debugging
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user with tenant
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({ error: 'Server configuration error. Please contact support.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        shopDomain: user.tenant.shopDomain
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Provide more specific error messages
    if (error.name === 'PrismaClientKnownRequestError') {
      return res.status(500).json({ error: 'Database error. Please check your database connection.' });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      // Still return success to prevent email enumeration
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt
      }
    });

    // Send email
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      // Delete the token if email fails
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id }
      });
      return res.status(500).json({ error: 'Failed to send reset email. Please try again later.' });
    }

    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Find reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Check if token is expired
    if (new Date() > resetToken.expiresAt) {
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      });
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    // Check if token has already been used
    if (resetToken.used) {
      return res.status(400).json({ error: 'Reset token has already been used' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true }
      })
    ]);

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

