export default interface RechargeRepositoryInterface {
  getHistories(): Promise<any>
  create(newRecharge: {}): Promise<any>
}
