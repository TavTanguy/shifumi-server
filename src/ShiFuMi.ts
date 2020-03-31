import User from "./User";
import Player from "./Player";
import ErrorApp from "./ErrorApp";
import { EventEmitter } from "events";
import Card from "./Card";
import Timeout from "./Timeout";
import { log } from "./logger";
import { incPartyPlayed, setNbParty, playCard as metricPlayCard } from "./metrics";

enum StatusParty {
  waitSecondPlayer,
  waitCardPlayers,
  showResult,
  restart,
  end
}

export enum TypePlayer {
  creator,
  second
}

export default class ShiFuMi extends EventEmitter {
  private static durationParty = 10 * 60 * 1000;
  private static listCurrentParty: ShiFuMi[] = [];
  private _statusParty: StatusParty;
  private id: number;
  private secret: number;
  private timeout: Timeout;
  public players: Player[] = [];
  public get name() {
    return `${this.secret}${this.id !== 0 ? "." + this.id : ""}`;
  }

  public constructor(playerCreator: User) {
    super();
    this.id = ShiFuMi.listCurrentParty.length;
    this.secret = this.regenerateSecret();
    this._statusParty = StatusParty.waitSecondPlayer;
    this.players.push(new Player(playerCreator));

    this.timeout = new Timeout(ShiFuMi.durationParty, this.destructor.bind(this));

    ShiFuMi.listCurrentParty.push(this);
    setNbParty(ShiFuMi.listCurrentParty.length);
  }

  public addSecondPlayer(user: User) {
    if (this.players[1]) throw new ErrorApp("This party have already player", "shiFuMi-addSecondPlayer0", "Cette partie est déjà complète");
    if (this.players[0].user === user) throw new ErrorApp("You already play on this party", "shiFuMi-addSecondPlayer1");
    if (this._statusParty !== StatusParty.waitSecondPlayer) throw new ErrorApp("This party don't wait player", "shiFuMi-addSecondPlayer2");
    this.players[1] = new Player(user);

    this.statusParty = StatusParty.waitCardPlayers;
    return this;
  }

  public getPlayer(user: User): Player | void {
    for (const pl of this.players) {
      if (pl.user === user) return pl;
    }
  }

  public playCard(user: User, card: Card) {
    if (this._statusParty !== StatusParty.waitCardPlayers) throw new ErrorApp("Is not the moment for play a card", "shiFuMi-playCard0");
    const pl = this.getPlayer(user);
    if (!pl) throw new ErrorApp("This user don't play on this party", "shiFuMi-playCard1");
    if (pl.card) throw new ErrorApp("This player have already card", "shiFuMi-playCard2", "Vous avez déjà joué une carte");
    pl.card = card;
    metricPlayCard(card);
    if (this.players[(this.players.indexOf(pl) + 1) % 2].card) this.statusParty = StatusParty.showResult;
  }

  private emitResult() {
    if (!this.players[0].card || !this.players[1].card) throw new ErrorApp("All don't have played", "shiFuMi-emitResult0");
    const resultForPl1 = this.players[0].card.resultWith(this.players[1].card);
    const resultForPl2 = this.players[1].card.resultWith(this.players[0].card);

    this.emit("result party", [resultForPl1, resultForPl2], [this.players[0].card, this.players[1].card]);
    incPartyPlayed();
  }

  public voteRestart(user: User) {
    if (this._statusParty !== StatusParty.showResult) throw new ErrorApp("Is not the moment for vote restart", "shiFuMi-voteRestart0");
    const pl = this.getPlayer(user);
    if (!pl) throw new ErrorApp("This user don't play on this party", "shiFuMi-playCard0");
    pl.voteRestart = true;
    if (this.players[(this.players.indexOf(pl) + 1) % 2].voteRestart) this.statusParty = StatusParty.restart;
  }

  public playerQuit(user: User) {
    if (this.statusParty !== StatusParty.end) {
      this.emit("player quit", user);
      this.destructor();
    }
  }

  private restartParty() {
    const users = this.players.map(pl => pl.user);
    this.players = users.map(user => new Player(user));
    this.timeout.time = ShiFuMi.durationParty;
    this.emit("restart party");
    this.statusParty = StatusParty.waitCardPlayers;
  }

  private set statusParty(value: StatusParty) {
    this._statusParty = value;
    this.emit("change status", value);
    switch (value) {
      case StatusParty.waitCardPlayers:
        this.emit("players select cards");
        break;
      case StatusParty.showResult:
        this.emitResult();
        break;
      case StatusParty.restart:
        this.restartParty();
        break;
    }
  }

  private destructor() {
    log(`Party ${this.name} was deleted`);

    this.statusParty = StatusParty.end;
    this.emit("delete party");
    const i = ShiFuMi.listCurrentParty.indexOf(this);
    ShiFuMi.listCurrentParty.splice(i, 1);
    setNbParty(ShiFuMi.listCurrentParty.length);
  }

  public regenerateSecret() {
    this.secret = Math.trunc(Math.random() * 9999);
    return this.secret;
  }

  public static get(nameParty: string): ShiFuMi | null {
    for (const party of ShiFuMi.listCurrentParty) {
      if (party.name === nameParty) return party;
    }
    return null;
  }
}
