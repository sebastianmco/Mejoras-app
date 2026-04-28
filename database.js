const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("database.db");

// Crear tablas
db.serialize(() => {

 // Tabla usuarios
 db.run(`
   CREATE TABLE IF NOT EXISTS users (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL
   )
 `);

 // Tabla tareas
 db.run(`
   CREATE TABLE IF NOT EXISTS tasks (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     title TEXT,
     user_id INTEGER,
     FOREIGN KEY(user_id) REFERENCES users(id)
   )
 `);

});

module.exports = db;
