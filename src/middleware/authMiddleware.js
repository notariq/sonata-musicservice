const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (token == null) return res.sendStatus(401);
  
    jwt.verify(token, 'your_jwt_secret_key', (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

const generateToken = (user) => {
    const token = jwt.sign(user, 'your_jwt_secret_key', { expiresIn: '1h' });
    return token;
};

module.exports = { authenticateToken, generateToken };