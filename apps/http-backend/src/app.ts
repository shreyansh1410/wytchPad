import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.post("/signup", (req, res) => {});
app.post("/signin", (req, res) => {});

app.get("/room", (req, res) => {});

app.listen(PORT, () => {
  console.log(`Server is listening at ${PORT}`);
});
