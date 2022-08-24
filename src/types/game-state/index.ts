import { Score } from "../score";

export interface GameState {
  set: number;
  sets: Score[];
  general: Score;
}