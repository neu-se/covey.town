import { RESTDataSource } from "apollo-datasource-rest";
class LaunchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = process.env.PORT;
  }
}

