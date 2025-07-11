const jwt = require("jsonwebtoken");

function auth(req, res, next){
    const token = req.cookies.token;
    try {
        const decoded = jwt.verify(token, process.env.JWT_CREATOR_SECRET)
        req.creatorId = decoded.id;
        next();
    } catch (error) {
        res.status(403).json({
            message: "You are not signed in"
        })
    }
}

module.exports = {
    auth
}