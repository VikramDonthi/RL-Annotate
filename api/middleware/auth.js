module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const secret = process.env.SESSION_SECRET || 'supersecrettoken123';
  
  if (!authHeader || authHeader !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized access. Please log in.' });
  }
  next();
};
