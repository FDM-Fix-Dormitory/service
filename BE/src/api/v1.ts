import { Router } from "express";

const app = Router();

app.get("/", (req, res) => {
  res.send("ok");
});

export { app as v1 };
