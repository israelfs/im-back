import express from "express";
import bodyParser from "body-parser";
import todoRouter from "./routers/todoRouter.js";

const app = express();

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.use("/", todoRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
