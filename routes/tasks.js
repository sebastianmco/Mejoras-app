const express = require("express");
const router = express.Router();
const db = require("../database");

// Crear tarea
router.post("/", (req, res) => {
  const { title, user_id } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "El título de la tarea es obligatorio." });
  }
  if (!user_id) {
    return res.status(400).json({ error: "Debes seleccionar un usuario." });
  }

  db.run(
    "INSERT INTO tasks(title, user_id) VALUES(?, ?)",
    [title.trim(), user_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, title: title.trim(), user_id });
    }
  );
});

// Obtener tareas con filtro opcional por id y nombre
router.get("/", (req, res) => {
  const { search_id, search_name } = req.query;

  let query = `
    SELECT tasks.id, tasks.title, users.name, users.id AS user_id
    FROM tasks
    JOIN users ON tasks.user_id = users.id
    WHERE 1=1
  `;
  const params = [];

  if (search_id && search_id.trim() !== "") {
    query += " AND tasks.id = ?";
    params.push(parseInt(search_id));
  }
  if (search_name && search_name.trim() !== "") {
    query += " AND LOWER(tasks.title) LIKE ?";
    params.push(`%${search_name.toLowerCase()}%`);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Obtener tarea por ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get(
    `SELECT tasks.id, tasks.title, tasks.user_id, users.name
     FROM tasks JOIN users ON tasks.user_id = users.id
     WHERE tasks.id = ?`,
    [id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "Tarea no encontrada." });
      res.json(row);
    }
  );
});

// Editar tarea
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { title, user_id } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "El título de la tarea es obligatorio." });
  }
  if (!user_id) {
    return res.status(400).json({ error: "Debes seleccionar un usuario." });
  }

  db.run(
    "UPDATE tasks SET title = ?, user_id = ? WHERE id = ?",
    [title.trim(), user_id, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Tarea no encontrada." });
      res.json({ id: parseInt(id), title: title.trim(), user_id });
    }
  );
});

// Eliminar tarea
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
