import express from "express";
import bcrypt from "bcrypt";
import ClientUser from "../models/ClientUser.js";

const router = express.Router();

// Register client user
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    const existing = await ClientUser.findOne({ email });
    if (existing) return res.status(400).json({ error: "Usuário já existe" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new ClientUser({ firstName, lastName, email, password: hashed });
    await user.save();

    res.json({ message: "Usuário cliente criado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
});

export default router;
