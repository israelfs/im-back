import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import bodyParser from "body-parser";
import todoRouter from "./routers/todoRouter.js";
import cors from "cors";

const app = express();
const server = http.createServer(app);

const wsServer = new WebSocketServer({ server });

wsServer.on("connection", (socket) => {
  console.log("A new client connected");
  socket.send("Welcome to the server!");

  socket.on("message", (msg) => {
    msg = msg.toString();
    wsServer.clients.forEach((client) => {
      if (client !== socket) {
        client.send(msg);
      }
    });
  });
});

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
