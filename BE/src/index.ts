import express from "express";
import { fileURLToPath } from "node:url";
import { v1 } from "./api/v1.js";
import { configDotenv } from "dotenv";
import { checkEnv } from "./checkEnv.js";

configDotenv({ path: ".env" });
if (!checkEnv(process.env)) throw new Error("필요한 환경변수가 없습니다");
const PORT = parseInt(process.env.PORT!);
// FE 정적 파일 폴더 (service/FE). src, dist 모두 BE 바로 아래라 같은 상대경로가 된다.
const FE_DIR = fileURLToPath(new URL("../../FE", import.meta.url));

const app = express();

app.use(express.json());
app.use("/api/v1", v1);

app.get("/", (req, res) => {
  res.redirect("/User/");
});
app.use(express.static(FE_DIR));

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT} 에서 서버가 열렸습니다.`);
});
