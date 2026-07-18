const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const correctUser = process.env.ADMIN_USERNAME || 'admin';
  const correctPass = process.env.ADMIN_PASSWORD || 'rl-annotate-secure';
  const secret = process.env.SESSION_SECRET || 'supersecrettoken123';

  if (username === correctUser && password === correctPass) {
    return res.status(200).json({ token: secret });
  } else {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
});

module.exports = router;
