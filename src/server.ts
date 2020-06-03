import express from "express";
import socketio from "socket.io";
import path from "path";
import { DrivethruRobotController } from "./drivethru-robot";
import { DrivethruServer } from "@bbfrc/drivethru";

const app = express();
app.set("port", 3000);

const http = require("http").Server(app);
const io = socketio(http);

app.use(express.static(path.resolve("./")));

app.get("/", (req: any, res: any) => {
    res.sendFile(path.resolve("./index.html"));
});


let _socket;
function socketEmit(channel: string, ...args: any[]) {
    if (_socket) {
        _socket.emit(channel, ...args);
    }
}

const drivethruRobot = new DrivethruRobotController(socketEmit)
const drivethruServer = new DrivethruServer(drivethruRobot, { port: 9001 });
drivethruServer.startP()
    .then(() => {
        console.log("Drivethru Server Up");

        const server = http.listen(3000, () => {
            console.log("Listenning on *:3000");
        });
    });




function getRandomInt(max): number {
    return Math.floor(Math.random() * Math.floor(max));
}

io.on("connection", (socket: SocketIO.Socket) => {
    console.log("User Connected");

    if (!_socket) {
        console.log("Assigning socketEmit");
        _socket = socket;
    }

    socket.emit("server-message", "hello world");

    // randomly change speed/direction every second
    // setInterval(() => {
    //     const steerValue = getRandomInt(10);
    //     const driveValue = getRandomInt(10);

    //     let drive: string;
    //     let steer: string;

    //     if (steerValue < 6) {
    //         steer = "none";
    //     }
    //     else if (steerValue < 8) {
    //         steer = "left";
    //     }
    //     else {
    //         steer = "right";
    //     }

    //     if (driveValue < 6) {
    //         drive = "forward";
    //     }
    //     else if (driveValue < 8) {
    //         drive = "brake";
    //     }
    //     else {
    //         drive = "none";
    //     }

    //     socket.emit("drive-cmd", {
    //         steer,
    //         drive
    //     })

    // }, 1000);
});
