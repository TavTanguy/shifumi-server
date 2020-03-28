import { readFileSync } from "fs";
import { createServer } from "https";
import ioSocket from "socket.io";
import UserCtrlSocketIo from "./UserCtrlSocketIo";
const options = {
  key: readFileSync("/etc/letsencrypt/live/shifumi.ttaverna.fr/privkey.pem"),
  cert: readFileSync("/etc/letsencrypt/live/shifumi.ttaverna.fr/cert.pem")
};
const app = createServer(options);

const io = ioSocket(app);
io.on("connection", socket => {
  new UserCtrlSocketIo(socket);
  console.log("new user");
});

app.listen(8085, () => {
  console.log("listen on 8085");
});
