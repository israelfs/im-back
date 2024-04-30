import express from "express";
import {
	getAllLocations,
	getAllCompanies,
} from "../controllers/todoController.js";

const router = express.Router();

router.get("/locations", getAllLocations);
router.get("/getAllCompanies", getAllCompanies);

export default router;
