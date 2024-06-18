import BaseRepository from "App/Repository/BaseRepository";
import Order from "App/Models/Order";

export default class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }
}
