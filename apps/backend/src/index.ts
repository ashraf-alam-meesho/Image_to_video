import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { promptRouter } from "./router/prompt";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use("/prompt", promptRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});