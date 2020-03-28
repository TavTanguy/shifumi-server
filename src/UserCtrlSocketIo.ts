import User, { PartyResult } from "./User";
import Ack, { TypeAck } from "./Ack";
import Card from "./Card";
import ShiFuMi from "./ShiFuMi";

export default class UserCtrlSocketIo {
  private socket: SocketIO.Socket;
  private user: User;

  constructor(socket: SocketIO.Socket) {
    console.log("New user " + socket.handshake.address);
    this.user = new User();
    this.user.on("delete party", () => {
      this.socket.emit("party delete");
    });
    this.user.on("player quit", () => {
      this.socket.emit("player leave");
    });
    this.user.on("restart party", () => {
      this.socket.emit("restart party");
    });
    this.socket = socket;
    socket.emit("first connection");

    socket.on("disconnect", () => {
      this.user.quitParty();
    });

    socket.on(
      "create party",
      Ack.try(() => {
        console.log("create party");
        return {
          nameParty: this.user.createParty(
            function(this: UserCtrlSocketIo) {
              this.socket.emit("players select cards");
            }.bind(this)
          )
        };
      })
    );

    socket.on(
      "regenerate secret",
      Ack.try(() => {
        return {
          nameParty: this.user.regenerateSecret()
        };
      })
    );

    socket.on(
      "join party",
      Ack.try((nameParty: string) => {
        this.user.joinParty(nameParty);
      })
    );

    socket.on(
      "play card",
      Ack.try((idCard: number) => {
        this.user.playCard(
          Card.get(idCard),
          function(this: UserCtrlSocketIo, partyResult: PartyResult, yourCard: Card, cardOfOpponent: Card) {
            this.socket.emit("result party", {
              partyResult,
              yourCard: yourCard.id,
              cardOfOpponent: cardOfOpponent.id
            });
          }.bind(this)
        );
      })
    );

    socket.on(
      "vote restart",
      Ack.try(() => {
        this.user.voteRestart();
      })
    );

    socket.on(
      "leave party",
      Ack.try(() => {
        this.user.quitParty();
      })
    );
  }
}
