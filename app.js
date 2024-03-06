import express from "express";
import bodyParser from "body-parser";

import { createTodo, getTodo, getTodos, removeTodo } from "./database.js";

const app = express();

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.get("/todos", async (req, res) => {
  const todos = await getTodos();
  res.send(todos);
});

app.get("/todo/:id", async (req, res) => {
  const id = req.params.id;
  const todo = await getTodo(id);
  res.send(todo);
});

app.post("/todo", async (req, res) => {
  const { title } = req.body;
  const todo = await createTodo(title);
  res.send(todo);
});

app.delete("/todo/:id", async (req, res) => {
  const id = req.params.id;
  await removeTodo(id);
  res.send("Todo removed");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
