import {OrderStatus} from "App/Enum/OrderStatus";

export interface Order {
  type?: string,
  side: string,
  symbol?: string,
  price: number,
  quantity: number,
  quantity_match?: number,
  status?: OrderStatus,
  user_id?: number,
  id?: number,
}
