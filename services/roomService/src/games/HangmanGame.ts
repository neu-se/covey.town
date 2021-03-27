import IGame from "./IGame";
import {nanoid} from "nanoid";

export default class HangmanGame implements IGame {
  private _id: string;

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  constructor() {
    this._id = nanoid();
  }
}
