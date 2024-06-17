export default class BaseRepository {
  constructor(protected model: any) {
  }

  public query (option: {} = {}, order: {} = {}) {
    delete option.limit
    delete option.page

    let query = this.model.query()
    if (option) {
      query = this.queryOptions(option, query)
    }

    return this.order(order, query)
  }

  public queryOptions(options = {}, query = this.model.query()) {
    for (const key in options) {
      const [column, operator = '='] = key.split(' ');
      const value = options[key];
      if (Array.isArray(value)) {
        query = query.whereIn(column, value);
      } else {
        query = query.where(column, operator, value);
      }
    }
    return query;
  }

  order(order = {}, query = this.model.query()) {
    if (Object.keys(order).length) {
      const [column, direction] = [Object.keys(order)[0], Object.values(order)[0]];
      query = query.orderBy(column, direction);
    }
    return query;
  }

  public async findAll(): Promise<any> {
    const data = await this.model.all();
    return Promise.resolve(data);
  }

  public async findById(id: number | string): Promise<any> {
    const data = await this.model.query().find(id);
    return Promise.resolve(data);
  }

  public async create(dataCreate: Object): Promise<any> {
    const data = await this.model.query().create(dataCreate);
    return Promise.resolve(data.$isPersisted);
  }

  public async update(id: number | string, data: Object): Promise<any> {
    const record = await this.model.query().find(id);
    if (!record) {
      throw new Error('Record not found');
    }
    record.merge(data);
    await record.save();
    return Promise.resolve(record);
  }

  public async delete(id: number | string): Promise<any> {
    const record = await this.model.query().find(id);
    if (!record) {
      throw new Error('Record not found');
    }
    await record.delete();
    return Promise.resolve(record);
  }
}
