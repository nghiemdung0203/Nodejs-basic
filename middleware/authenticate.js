const jwt = require('jsonwebtoken');
const User = require('../Model/User');

const authenticate = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    // Check if authorization header exists
    if (!authHeader) {
        return res.status(401).send({ error: 'No token provided, authorization denied.' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const data = jwt.verify(token, process.env.JWT_SECRET); // Log the decoded JWT data

        const user = await User.findOne({ _id: data._id, 'tokens.token': token });

        if (!user) {
            return res.status(401).send({ error: 'Not authorized to access this resource.' });
        }

        req.user = {
            _id: user._id,
            name: user.name,
            age: user.age,
            email: user.email,
            tokens: user.tokens
        };
        req.token = token;

        next();
    } catch (error) {
        res.status(401).send({ error: 'Not authorized to access this resource.' });
    }
};

module.exports = authenticate;
