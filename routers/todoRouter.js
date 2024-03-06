import express from "express";
import {
  addTodo,
  deleteTodo,
  getAllTodos,
  getTodoById,
} from "../controllers/todoController.js";

const router = express.Router();

router.get("/todos", getAllTodos);
router.get("/todo/:id", getTodoById);
router.post("/todo", addTodo);
router.delete("/todo/:id", deleteTodo);

export default router;
