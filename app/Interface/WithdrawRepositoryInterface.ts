export default interface WithdrawRepositoryInterface {
  getHistories(): Promise<any>
  create(newRecharge: {}): Promise<any>
}
