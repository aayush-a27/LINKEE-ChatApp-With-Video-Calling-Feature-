import crypto from 'crypto';

// Simple CSRF protection middleware
export const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET requests
  if (req.method === 'GET') {
    return next();
  }

  // Check for CSRF token in headers
  const token = req.headers['x-csrf-token'];
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({ 
      message: 'CSRF token validation failed',
      error: 'Invalid or missing CSRF token'
    });
  }

  next();
};

// Generate CSRF token endpoint
export const generateCSRFToken = (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  
  // Store in session (you'll need session middleware)
  if (req.session) {
    req.session.csrfToken = token;
  }

  res.json({ csrfToken: token });
};