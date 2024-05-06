import express from "express";
import http from "http";
import bodyParser from "body-parser";
import todoRouter from "./routers/todoRouter.js";
import cors from "cors";
import path from "path";

const app = express();
const server = http.createServer(app);

// const distPath = path.resolve(__dirname, "public/imediatum-todo-app");
app.use(
	express.static(
		"/home/israel/Documents/imediatum/im-todo-frontend/dist/imediatum-todo-app/browser/"
	)
);
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
