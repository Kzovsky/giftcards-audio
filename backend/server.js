// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import giftLinksRoutes from "./routes/giftLinks.js";
import cardsRoutes from "./routes/cards.js";


// 🔧 Força o dotenv a carregar o .env do diretório backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();

// habilita CORS
// app.use(cors());


app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// só faz parse se Content-Type for application/json
app.use(express.json({ type: "application/json" }));

// rotas
app.use("/api/auth", authRoutes);
app.use("/api/gift-links", giftLinksRoutes);
app.use("/api/cards", cardsRoutes);
// porta
const PORT = process.env.PORT || 4000;

// conexão com Mongo
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB conectado");
    console.log("🌍 R2 endpoint:", process.env.CLOUDFLARE_R2_ENDPOINT);
    console.log("🔑 Access key:", process.env.CLOUDFLARE_ACCESS_KEY_ID ? "OK" : "❌ MISSING");
    console.log("🔒 Secret key:", process.env.CLOUDFLARE_SECRET_ACCESS_KEY ? "OK" : "❌ MISSING");
    app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
  })
  .catch((err) => console.error("❌ Erro ao conectar no MongoDB:", err));
