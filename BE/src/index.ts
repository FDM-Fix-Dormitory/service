import express from "express";
import { v1 } from "./api/v1.js";
import { configDotenv } from "dotenv";
import { checkEnv } from "./checkEnv.js";

configDotenv({ path: ".env" });
if (!checkEnv(process.env)) throw new Error("필요한 환경변수가 없습니다");
const PORT = parseInt(process.env.PORT!);

const app = express();

app.use(express.json());
app.use("/api/v1", v1);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT} 에서 서버가 열렸습니다.`);
});
