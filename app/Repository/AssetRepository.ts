import BaseRepository from "App/Repository/BaseRepository";
import Asset from "App/Models/Asset";

export default class AssetRepository extends BaseRepository {
  constructor() {
    super(Asset);
  }
}
