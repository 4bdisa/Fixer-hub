import jwt from "jsonwebtoken";
import User from "../models/user.js"; // Import User model to fetch user details

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }


    req.user = user;
    next();
  } catch (err) {
    console.error("Authentication Error:", err); // Debugging
    res.status(401).json({ message: "Invalid or Expired Token" });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access Denied: Insufficient Permissions" });
    }
    next();
  };
};

// middlewares/authMiddleware.js
export const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "Unauthorized - Login Required" });
};