const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const userRoutes = require("./routes/users");
const taskRoutes = require("./routes/tasks");

app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);

app.listen(3000, () => {
 console.log("Servidor en http://localhost:3000");
});
