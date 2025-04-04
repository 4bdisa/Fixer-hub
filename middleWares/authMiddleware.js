import jwt from "jsonwebtoken";
import User from "../models/user.js"; // Import User model to fetch user details

export const protect = async (req, res, next) => {
  try {
    // Get the token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No Token Provided" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from the database
    const user = await User.findById(decoded.userId).select("-password"); // Exclude password for security

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // Attach user data to request
    next();
  } catch (err) {
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