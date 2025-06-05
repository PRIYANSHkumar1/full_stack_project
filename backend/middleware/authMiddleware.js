import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

// Middleware to protect routes by verifying JWT authentication token.
const protect = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      res.statusCode = 401;
      throw new Error('Authentication failed: Token not provided.');
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken || !decodedToken.userId) {
      res.statusCode = 401;
      throw new Error('Authentication failed: Invalid token.');
    }

    const user = await User.findById(decodedToken.userId).select('-password');
    
    if (!user) {
      res.statusCode = 401;
      throw new Error('Authentication failed: User not found.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.statusCode = 401;
      return next(new Error('Authentication failed: Token expired. Please login again.'));
    }
    if (error.name === 'JsonWebTokenError') {
      res.statusCode = 401;
      return next(new Error('Authentication failed: Invalid token.'));
    }
    next(error);
  }
};

// Middleware to check if the user is an admin.
const admin = (req, res, next) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      res.statusCode = 401;
      throw new Error('Authorization failed: Not authorized as an admin.');
    }
    next();
  } catch (error) {
    next(error);
  }
};

export { protect, admin };
