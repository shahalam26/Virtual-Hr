import { verifyToken } from "../utils/jwt.js";

export const auth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.id ?? decoded._id,
      email: decoded.email,
    };
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
};
