const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
    console.log('Authenticating request...');
    const token = req.header('Authorization');

    if (!token) {
        console.error('No token, authorization denied');
        return res.status(401).json({ error: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded.user;
        console.log('Authentication successful:', req.user);
        next();
    } catch (err) {
        console.error('Token is not valid:', err);
        res.status(401).json({ error: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
