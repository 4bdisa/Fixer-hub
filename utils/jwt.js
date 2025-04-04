import jwt from "jsonwebtoken";

// Generate JWT Token with userId and role
export const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
