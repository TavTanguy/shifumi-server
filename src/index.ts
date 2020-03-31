import { readFileSync } from "fs";
import { createServer } from "https";
import ioSocket from "socket.io";
import UserCtrlSocketIo from "./UserCtrlSocketIo";
process.title = "ShiFuMi - server";
import { log } from "./logger";
import "./metrics";
const options = {
  key: readFileSync("/etc/letsencrypt/live/shifumi.ttaverna.fr/privkey.pem"),
  cert: readFileSync("/etc/letsencrypt/live/shifumi.ttaverna.fr/cert.pem")
};
const app = createServer(options);

const io = ioSocket(app);
io.on("connection", socket => {
  new UserCtrlSocketIo(socket);
});

app.listen(8085, () => {
  log("listen on 0.0.0.0:8085");
});
