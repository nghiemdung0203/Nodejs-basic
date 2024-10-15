const jwt = require('jsonwebtoken');
const User = require('../Model/User');

const authenticate = async (req, res, next) => {
    const token = req.headers['authorization'].replace('Bearer ', '');

    if (!token) {
        return res.status(401).send({ error: 'No token provided, authorization denied.' });
    }

    console.log(token)

    try {
        const data = jwt.verify(token, process.env.JWT_SECRET); // Log the decoded JWT data

        const user = await User.findOne({ _id: data._id, 'tokens.token': token });

        if (!user) {
            return res.status(401).send({ error: 'Not authorized to access this resource.' });
        }

        req.user = user;
        req.token = token;

        next();
    } catch (error) {
        console.error("JWT Verification error:", error.message); // Log any verification error
        res.status(401).send({ error: 'Not authorized to access this resource.' }); // Send error response
    }
};

module.exports = authenticate;
