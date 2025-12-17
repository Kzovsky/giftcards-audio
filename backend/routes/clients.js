import express from "express";
import bcrypt from "bcrypt";
import ClientUser from "../models/ClientUser.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

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

// Client login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await ClientUser.findOne({ email });
    if (!user) return res.status(401).json({ error: "Credenciais inválidas" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Credenciais inválidas" });

    const token = jwt.sign({ id: user._id, email: user.email, role: "user" }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao autenticar" });
  }
});

// Get current client user
router.get("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: "Sem autorização" });
    const token = auth.replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await ClientUser.findById(decoded.id).select("firstName lastName email phone");
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Token inválido" });
  }
});

// Update current client user
router.patch("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: "Sem autorização" });
    const token = auth.replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET);

    const { firstName, lastName, phone, password } = req.body;
    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (phone) updates.phone = phone;
    if (password) updates.password = await bcrypt.hash(password, 10);

    const user = await ClientUser.findByIdAndUpdate(decoded.id, updates, { new: true }).select(
      "firstName lastName email phone"
    );
    res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Token inválido ou erro ao atualizar" });
  }
});

export default router;
