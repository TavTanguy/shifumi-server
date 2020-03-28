import User from "./User";
import Card from "./Card";

export default class Player {
  private _user: User;
  public get user() {
    return this._user;
  }
  public card?: Card;
  public voteRestart: boolean = false;
  constructor(user: User) {
    this._user = user;
  }
}
