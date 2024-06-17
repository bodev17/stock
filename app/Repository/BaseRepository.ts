export default class BaseRepository {
  constructor(private model) {
  }

  public async findAll():Promise<any> {
    const data = await this.model.all();
    return Promise.resolve(data);
  }

  public async findById(id: number|string):Promise<any> {
    const data = await this.model.find(id);
    return Promise.resolve(data);
  }

  public async create(dataCreate: Object):Promise<any> {
    const data = await this.model.create(dataCreate);
    return Promise.resolve(data.$isPersisted);
  }

  public async update(id: number|string, data: Object):Promise<any> {
    const record = await this.model.find(id);
    if (!record) {
      throw new Error('Record not found');
    }
    record.merge(data);
    await record.save();
    return Promise.resolve(record);
  }

  public async delete(id):Promise<any> {
    const record = await this.model.find(id);
    if (!record) {
      throw new Error('Record not found');
    }
    await record.delete();
    return Promise.resolve(record);
  }
}
