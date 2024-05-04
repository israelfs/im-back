import express from "express";
import http from "http";
import bodyParser from "body-parser";
import todoRouter from "./routers/todoRouter.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);

const distPath = path.resolve(__dirname /* server */, "../" /* dist */);
app.use(express.static(distPath));
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
app.use(bodyParser.json());

app.use(cors());

app.use("/", todoRouter);

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send("Something broke!");
});

server.listen(3000, () => {
	console.log("Example app listening on port 3000!");
});
