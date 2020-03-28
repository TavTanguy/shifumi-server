import ErrorApp from "./ErrorApp";

export enum ResultCard {
  equal,
  winner,
  losser
}

export default class Card {
  private static listCard = [new Card(0, "Pierre", 1), new Card(1, "Feuille", 2), new Card(2, "Ciseaux", 0)];
  private _id: number;
  public get id() {
    return this._id;
  }
  private _name: string;
  private idLoseAgainst: number;
  public get name() {
    return this._name;
  }

  constructor(id: number, name: string, idLoseAgainst: number) {
    this._id = id;
    this._name = name;
    this.idLoseAgainst = idLoseAgainst;
  }

  public isWinsWith(card: Card) {
    return card.idLoseAgainst === this._id;
  }

  public resultWith(card: Card) {
    if (card._id === this._id) return ResultCard.equal;
    if (this.isWinsWith(card)) return ResultCard.winner;
    return ResultCard.losser;
  }

  public static get(id: number) {
    const card = Card.listCard[id];
    if (!card) throw new ErrorApp("Card does not exist", "Card-get0", "Cette carte n'existe pas");
    return card;
  }
}
