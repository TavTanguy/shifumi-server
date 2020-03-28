import Ack from "Ack";

export default class ErrorApp extends Error {
  public code: string;
  public publicMessage?: string;

  public constructor(message: string, code: string, publicMessage?: string) {
    super(message);
    this.code = code;
    if (publicMessage) this.publicMessage = publicMessage;
  }
}
