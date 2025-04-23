import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import authRoutes from "./routes/authRoutes.js";
import "./config/passport.js"; // Passport Config
import jobs from "./routes/jobs.js"; // Import the jobs route
import userRoutes from "./routes/userRoutes.js"; // Import the user route
import requestRoutes from "./routes/requestRoutes.js"; // Import the request route

dotenv.config();
const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
);
app.use(express.json());
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  next();
});

// Routes
app.use("/", authRoutes);
app.use("/api", authRoutes, jobs, userRoutes);
app.use("/api", jobs);
app.use("/api/v1", requestRoutes);

// Database & Server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`✅ Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error(err));