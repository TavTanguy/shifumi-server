import ShiFuMi, { TypePlayer } from "./ShiFuMi";
import ErrorApp from "./ErrorApp";
import Card from "./Card";
import { EventEmitter } from "events";

export enum PartyResult {
  win,
  lose,
  equality
}

export default class User extends EventEmitter {
  private _currentParty?: ShiFuMi;
  private set currentParty(party: ShiFuMi | undefined) {
    if (party) this.setListeners(party);
    this._currentParty = party;
  }
  private get currentParty(): ShiFuMi | undefined {
    return this._currentParty;
  }
  private typePlayer?: TypePlayer;
  private get id() {
    return this.typePlayer === TypePlayer.creator ? 0 : 1;
  }

  public createParty(cb: () => void) {
    if (this.currentParty) throw new ErrorApp("You already play at party", "user-createParty0", "Vous joué déjà à une partie");
    this.currentParty = new ShiFuMi(this);
    this.currentParty.on("players select cards", cb);
    this.typePlayer = TypePlayer.creator;
    return this.currentParty.name;
  }

  public regenerateSecret() {
    if (this?.typePlayer !== TypePlayer.creator || !this.currentParty) throw new ErrorApp("You must to be the creator player", "player-regenerateSecret0");
    this.currentParty.regenerateSecret();
    return this.currentParty.name;
  }

  public joinParty(nameParty: string) {
    if (this.currentParty) throw new ErrorApp("You already play at party", "player-joinParty0");
    const party = ShiFuMi.get(nameParty);
    if (party) {
      party.addSecondPlayer(this);
      this.currentParty = party;
    } else throw new ErrorApp("Party not found", "user-joinParty1", "Partie non trouvé");
  }

  public playCard(card: Card, cbResult: (partyResult: PartyResult, yourCard: Card, cardOfOpponent: Card) => void) {
    if (!this.currentParty) throw new ErrorApp("You don't play at party", "user-playCard0");
    this.currentParty.on("result party", (resultsCard, cards) => {
      cbResult(resultsCard[this.id] as PartyResult, cards[this.id], cards[(this.id + 1) % 2]);
    });
    this.currentParty?.playCard(this, card);
  }

  public voteRestart() {
    if (!this.currentParty) throw new ErrorApp("You don't play at party", "user-voteRestart0");
    this.currentParty.voteRestart(this);
  }

  public quitParty() {
    if (!this.currentParty) return;
    this.currentParty.playerQuit(this);
  }

  private setListeners(party: ShiFuMi) {
    party.on("delete party", () => {
      this.currentParty = undefined;
      this.emit("delete party");
    });
    party.on("player quit", (user: User) => {
      if (user !== this) this.emit("player quit");
    });
    party.on("restart party", () => {
      this.emit("restart party");
    });
  }
}
