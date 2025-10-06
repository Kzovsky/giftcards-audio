// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import giftLinksRoutes from "./routes/giftLinks.js";

dotenv.config();

const app = express();

// habilita CORS
app.use(cors());

// só faz parse se Content-Type for application/json
app.use(express.json({ type: "application/json" }));

// rotas
app.use("/api/auth", authRoutes);
app.use("/api/gift-links", giftLinksRoutes);

// porta
const PORT = process.env.PORT || 4000;

// conexão com Mongo
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB conectado");
    app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
  })
  .catch((err) => console.error("❌ Erro ao conectar no MongoDB:", err));
