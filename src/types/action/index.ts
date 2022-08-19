export interface Action {
  id: string;
  name: string;
  result: number;
  type: string; //"block" | "attack" | "serve" | "receive" | "error";
}