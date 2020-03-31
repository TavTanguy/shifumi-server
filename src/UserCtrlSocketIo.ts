import User, { PartyResult } from "./User";
import Ack, { TypeAck } from "./Ack";
import Card from "./Card";
import { log } from "./logger";
import ErrorApp from "./ErrorApp";
import { markReqParHour, incUserConnected, decUserConnected } from "./metrics";

export default class UserCtrlSocketIo {
  private socket: SocketIO.Socket;
  private user: User;

  constructor(socket: SocketIO.Socket) {
    this.socket = socket;
    log(`New user ${this.socket.handshake.address} with id ${this.socket.id}`);
    incUserConnected();
    markReqParHour();
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
    socket.emit("first connection");

    socket.on("disconnect", (reason: string) => {
      log(`${this.socket.id} was disconnected with reason ${reason}`);
      this.user.quitParty();
      decUserConnected();
    });

    socket.on(
      "create party",
      Ack.try(() => {
        markReqParHour();
        const nameParty = this.user.createParty(
          function(this: UserCtrlSocketIo) {
            this.socket.emit("players select cards");
          }.bind(this)
        );
        log(`${this.socket.id} create party ${nameParty}`);
        return {
          nameParty
        };
      })
    );

    socket.on(
      "regenerate secret",
      Ack.try(() => {
        markReqParHour();
        const nameParty = this.user.regenerateSecret();
        log(`${this.socket.id} regenerate secret to ${nameParty}`);
        return {
          nameParty
        };
      })
    );

    socket.on(
      "join party",
      Ack.try((nameParty: string) => {
        markReqParHour();
        try {
          this.user.joinParty(nameParty);
          log(`${this.socket.id} join party ${nameParty}`);
        } catch (err) {
          if (err instanceof ErrorApp && err.code === "user-joinParty1") log(`${socket.id} try to join wrong party with ${nameParty}`);
          throw err;
        }
      })
    );

    socket.on(
      "play card",
      Ack.try((idCard: number) => {
        markReqParHour();
        const card = Card.get(idCard);
        log(`${this.socket.id} play card ${card.name}`);
        this.user.playCard(
          card,
          function(this: UserCtrlSocketIo, partyResult: PartyResult, yourCard: Card, cardOfOpponent: Card) {
            log(`${this.socket.id} finish party result: ${PartyResult[partyResult]}`);
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
        markReqParHour();
        log(`${this.socket.id} vote restart`);
        this.user.voteRestart();
      })
    );

    socket.on(
      "leave party",
      Ack.try(() => {
        markReqParHour();
        log(`${this.socket.id} leave party`);
        this.user.quitParty();
      })
    );
  }
}
