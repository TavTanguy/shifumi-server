import ErrorApp from "./ErrorApp";

export default class Timeout {
  private _time: number;
  public set time(value: number) {
    if (!this.idTimeout) throw new ErrorApp("timeout expired", "timeout-set-time0");
    this._time = value;
    this.setTimeout();
  }
  private fn: () => void;
  private idTimeout?: NodeJS.Timeout;

  constructor(time: number, fn: () => void) {
    this._time = time;
    this.fn = fn;

    this.setTimeout();
  }

  private setTimeout() {
    if (this.idTimeout) clearTimeout(this.idTimeout);
    this.idTimeout = setTimeout(() => {
      if (this.idTimeout) {
        this.idTimeout = undefined;
        this.fn();
      }
    }, this._time);
  }
}
