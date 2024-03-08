import { test, describe, it } from "node:test";
import assert from "node:assert";

import {
  createTodo,
  getTodo,
  getTodos,
  removeTodo,
  updateTodo,
} from "./database.js";

test("GET all todos", async () => {
  const todos = await getTodos();
  assert(todos.length > 0, "The number of todos is greater than 0");
});

test("GET a todo by id", async () => {
  const todo = await getTodo(59);
  const expectedTodo = {
    id: 59,
    title: "Ir para casa",
    lat: -26.3288,
    lng: -48.8512,
  };
  assert.deepStrictEqual(todo, expectedTodo);
});

test("CREATE a todo", async () => {
  const todo = await createTodo("Test Create", -26.3488, -48.8212);
  const expectedTodo = {
    id: todo.id,
    title: "Test Create",
    lat: -26.3488,
    lng: -48.8212,
  };
  assert.deepStrictEqual(todo, expectedTodo);
});

test("DELETE a todo", async () => {
  const todo = await createTodo("Test Delete", -26.3488, -48.8212);
  await removeTodo(todo.id);
  const deletedTodo = await getTodo(todo.id);
  assert.strictEqual(deletedTodo, undefined);
});

test("UPDATE a todo", async () => {
  const todo = await createTodo("Test Update", -26.3488, -48.8212);
  await updateTodo(todo.id, "Test Update Updated", -26.3288, -48.8512);
  const updatedTodo = await getTodo(todo.id);
  const expectedTodo = {
    id: todo.id,
    title: "Test Update Updated",
    lat: -26.3288,
    lng: -48.8512,
  };
  assert.deepStrictEqual(updatedTodo, expectedTodo);
});
