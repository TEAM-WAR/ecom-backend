import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import apiRoutes from "./routes/index.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());

// Middleware CORS pour permettre les requêtes depuis le frontend
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Servir les fichiers statiques (images uploadées)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes API
app.use("/api", apiRoutes);

// Route de test
app.get("/", (req, res) => {
  res.json({ message: "API E-commerce Backend - Fonctionnel !" });
});

// Connexion MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connecté avec succès");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Serveur démarré sur le port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion MongoDB:", err);
  });
