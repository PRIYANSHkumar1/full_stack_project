import jwt from 'jsonwebtoken';

export const generateToken = (req, res, userId) => {
  // Generating a JWT token for the authenticated user
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: req.body.remember ? '30d' : '7d'
  });

  // Cookie options for security with deployment compatibility
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only secure in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // 'none' for cross-origin in production
    maxAge: req.body.remember ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000, // 30 days or 7 days
    path: '/'
  };

  // Setting the JWT as an HTTP-only cookie for enhanced security
  res.cookie('jwt', token, cookieOptions);
  
  // Store token expiration in the response for frontend use
  const expirationTime = Date.now() + (req.body.remember ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000);
  
  return { token, expirationTime };
};
