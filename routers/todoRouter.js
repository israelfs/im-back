import express from "express";
import {
	getAllLocations,
	getAllMonoOperatorLocations,
	getAllBiOperatorLocations,
	getAllTripleOperatorLocations,
} from "../controllers/todoController.js";

const router = express.Router();

router.get("/locations", getAllLocations);
router.get("/monoOperatorLocations", getAllMonoOperatorLocations);
router.get("/biOperatorLocations", getAllBiOperatorLocations);
router.get("/tripleOperatorLocations", getAllTripleOperatorLocations);

export default router;
