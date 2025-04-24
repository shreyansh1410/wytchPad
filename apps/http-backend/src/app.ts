import 'dotenv/config';
import express from "express";
import { signUpController } from "./controllers/signUpController";
import { signInController } from "./controllers/signInController";
import { roomController } from "./controllers/roomController";
import { middleware } from "./middlewares";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.post("/signup", signUpController);
app.post("/signin", signInController);

app.post("/room", middleware, roomController);

app.listen(PORT, () => {
  console.log(`Server is listening at ${PORT}`);
});
