import {Direction} from "App/Enum/Direction";

export interface SymbolPrice {
  volume: string;
  symbol: string;
  price: string;
  change: string;
  direction: Direction
}

