import express from "express";
import cors from "cors";
import 'dotenv/config.js';
import { connect } from "mongoose";
import { connectDB } from "./config/db.js";

const PORT = 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DB
await connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
