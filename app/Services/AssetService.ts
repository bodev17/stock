import {inject} from "@adonisjs/fold";
import AssetRepository from "App/Repository/AssetRepository";

@inject()
export default class AssetService {
  constructor(private assetRepository: AssetRepository) {
  }
}
