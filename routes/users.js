const express = require("express");
const router = express.Router();
const db = require("../database");

// Crear usuario
router.post("/", (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "El nombre del usuario es obligatorio." });
  }

  db.run("INSERT INTO users(name) VALUES(?)", [name.trim()], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name: name.trim() });
  });
});

// Obtener usuarios
router.get("/", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
