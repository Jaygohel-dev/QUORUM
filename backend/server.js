import express from "express";
import cors from "cors";
import 'dotenv/config.js';
import { connect } from "mongoose";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/authRoutes.js";

const PORT = 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DB
await connectDB();

// Routes
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
