import express from "express";
import path from "path";

const app = express();
app.set("port", 3000);

const http = require("http").Server(app);

app.use(express.static(path.resolve("./")));


app.get("/", (req: any, res: any) => {
    res.sendFile(path.resolve("./index.html"));
});

const server = http.listen(3000, () => {
    console.log("Listenning on *:3000");
});