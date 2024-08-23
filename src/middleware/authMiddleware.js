const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // 'Bearer <token>'
  
    if (token == null) return res.sendStatus(401); // Unauthorized
  
    jwt.verify(token, 'your_jwt_secret_key', (err, user) => {
      if (err) return res.sendStatus(403); // Forbidden
  
      req.user = user; // Attach user information to the request object
      //console.log(req.user.user.username)
      next();
    });
  };

const generateToken = (user) => {
    const token = jwt.sign(user, 'your_jwt_secret_key', { expiresIn: '1h' });
    // console.log('Generated Token:', token); 
    return token;
};

module.exports = { authenticateToken, generateToken };