/*import ShiFuMi from "./ShiFuMi";
import ErrorApp from "./ErrorApp";
import Ack, { TypeAck } from "./Ack";

export default class Player {
  public readonly socket: SocketIO.Socket;
  private currentParty?: ShiFuMi;

  public constructor(socket: SocketIO.Socket) {
    this.socket = socket;

    this.socket.on("create party", ack => {
      try {
        if (this.currentParty) return new Ack(ack, TypeAck.error, { message: "Vous avez déjà une partie" });
        this.currentParty = new ShiFuMi(this);
        new Ack(ack, TypeAck.success, { nameParty: this.currentParty.name });
      } catch (err) {
        Ack.unknowErr(ack);
      }
    });

    this.socket.on("regenerate secret", ack => {
      try {
        if (this !== this?.currentParty?.players[0])
          return new Ack(ack, TypeAck.error, { message: "Vous n'avez pas créer de partie" });
        this.currentParty.regenerateSecret();
        new Ack(ack, TypeAck.success, { nameParty: this.currentParty.name });
      } catch (err) {
        Ack.unknowErr(ack);
      }
    });

    this.socket.on("join party", (nameParty: string, ack) => {
      try {
        if (this.currentParty) return new Ack(ack, TypeAck.error, { message: "Vous avez déjà une partie" });
        const party = ShiFuMi.get(nameParty);
        if (!party) return new Ack(ack, TypeAck.error, { message: "Code partie introuvable" });
        this.currentParty = party.addSecondPlayer(this);
      } catch (err) {
        if (err instanceof ErrorApp && err?.code === "shiFuMi-addSecondPlayer0")
          return new Ack(ack, TypeAck.error, { message: err.publicMessage, code: err.code });
        else Ack.unknowErr(ack);
      }
    });
  }

  public sendSelectCards() {
    this.socket.emit("select cards");
  }
}
*/