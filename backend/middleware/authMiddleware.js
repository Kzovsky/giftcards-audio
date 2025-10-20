import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"]; 
  if (!authHeader) {
    return res.status(401).json({ error: "Token não enviado" });
  }


  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT inválido:", err.message);
    res.status(401).json({ error: "Token inválido" });
  }
}
