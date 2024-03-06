import {
  createTodo,
  getTodo,
  getTodos,
  removeTodo,
} from "../database/database.js";

export async function getAllTodos(req, res) {
  const todos = await getTodos();
  res.send(todos);
}

export async function getTodoById(req, res) {
  const id = req.params.id;
  const todo = await getTodo(id);
  res.send(todo);
}

export async function addTodo(req, res) {
  const { title } = req.body;
  const todo = await createTodo(title);
  res.send(todo);
}

export async function deleteTodo(req, res) {
  const id = req.params.id;
  await removeTodo(id);
  res.send("Todo removed");
}
