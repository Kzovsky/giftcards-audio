import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const router = express.Router();


router.post("/register", async (req, res) => {
  try {
    const { email, password, role, masterKey } = req.body;

    if (masterKey !== process.env.MASTER_KEY) {
      return res.status(403).json({ error: "Chave mestre inválida" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Usuário já existe" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed, role });
    await user.save();

    res.json({ message: "✅ Usuário criado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
});

router.post("/login", async (req, res) => {
  try {
    console.log("📩 Dados recebidos:", req.body);
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Credenciais inválidas" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Credenciais inválidas" });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    console.error("❌ Erro ao registrar usuário:", err);
    res.status(500).json({ error: "Erro interno no servidor", details: err.message });
    res.status(500).json({ error: "Erro ao fazer login" });
  }
});

export default router;
