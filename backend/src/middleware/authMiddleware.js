import jwt from "jsonwebtoken";

function verifyJwt(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).send("no token in header");
    
    try {
    var decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);
    req.user = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
    }
    //console.log(`Authenticated user: ${req.user.username} with role: ${req.user.role} and id: ${req.user.id}`);

    next(); 
    } catch (err) {
        console.error("JWT verification failed:", err);
        return res.status(403).send("invalid token");
    } 
}

function isAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        console.warn(`Access denied for user '${req.user.username}' with role '${req.user.role}'`);
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
} 

export { verifyJwt, isAdmin};  