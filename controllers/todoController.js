import {
  createTodo,
  getTodo,
  getTodos,
  removeTodo,
  updateTodo,
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

export async function editTodoById(req, res) {
  const id = req.params.id;
  const { title } = req.body;
  await updateTodo(id, title);
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
  res.send({
    message: `Todo with id ${id} has been removed`,
  });
}
