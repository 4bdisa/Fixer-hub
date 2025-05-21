import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import authRoutes from "./routes/authRoutes.js";
import "./config/passport.js"; // Passport Config
import userRoutes from "./routes/userRoutes.js"; // Import the user route
import requestRoutes from "./routes/requestRoutes.js"; // Import the request route  
import transactionRoutes from "./routes/transactionRoutes.js"; // Import the transaction route
import reportRoutes from './routes/reportRoutes.js'; // Corrected import
import adminRouter from "./routes/adminRoute.js"; // Import the admin route

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = ['https://fixerhub.vercel.app', process.env.FRONTEND_URL];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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
app.use("/api", authRoutes, userRoutes);
app.use("/api/v1", requestRoutes);
app.use("/api/transactions", transactionRoutes);
app.use('/api/reports', reportRoutes); // Use the report routes
app.use("/api/admin", adminRouter); // Use the user routes
app.all("*", (req, res) => {
  res.status(404).json({
    message: `Route  ${req.originalUrl}not found`,
  });
}
);
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