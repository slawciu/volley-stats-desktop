import { Player } from "../player";

export type Team = {
  name: string;
  shortName: string;
  id: string;
  players: Player[];
};