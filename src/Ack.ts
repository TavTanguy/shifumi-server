import ErrorApp from "./ErrorApp";
import { error } from "./logger";

export enum TypeAck {
  success = "success",
  error = "error"
}

export default class Ack {
  public static unknowErr(funcAck: Function) {
    return new Ack(funcAck, TypeAck.error, { message: "Erreur serveur inconnue" });
  }
  public static try(fn: (...args: any[]) => ({ type?: TypeAck } & Object) | void) {
    return function(...argsAndFn: any[]) {
      const funcAck: Function = argsAndFn[argsAndFn.length - 1];
      const args = argsAndFn.slice(0, argsAndFn.length - 1);
      try {
        const result = fn(...args);
        if (!result) {
          new Ack(funcAck, TypeAck.success, {});
        } else {
          let { type, ...obj } = result;
          if (!type) type = TypeAck.success;
          new Ack(funcAck, type, obj);
        }
      } catch (err) {
        const obj: { message?: string; code?: string } = { message: "Erreur interne" };
        if (err instanceof ErrorApp) {
          if (err.publicMessage) obj.message = err.publicMessage;
          if (err.code) obj.code = err.code;
          error(`Error: ${err.message} ${err.code ? `Code: ${err.code}` : ""} ${err.publicMessage ? `publicMSg: ${err.publicMessage}` : ""}`);
        } else error(err);
        new Ack(funcAck, TypeAck.error, obj);
      }
    };
  }
  public constructor(funcAck: Function, type: TypeAck, objAck: Object) {
    funcAck({
      type: type.toString(),
      ...objAck
    });
  }
}
