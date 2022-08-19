import { Player } from "../player";
import { Action } from "../action";

export interface Touch {
  players: Player[];
  action: Action;
}
