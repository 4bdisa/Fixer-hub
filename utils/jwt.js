import jwt from "jsonwebtoken";

// Generate JWT Token with userId and role
export const generateToken = (userId, role, name) => { 
  return jwt.sign({ userId, role, name }, process.env.JWT_SECRET, { 
    expiresIn: "30d", 
  }); 
};
