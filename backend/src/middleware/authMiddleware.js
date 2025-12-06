import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = {
      userId: decoded.userId,
      tenantId: decoded.tenantId
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

