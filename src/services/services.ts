import 'reflect-metadata';
import { ReflectiveInjector } from "injection-js";
import { CreatorService } from "./creator.service";
import { LlmService } from "./llm.service";

const injector = ReflectiveInjector.resolveAndCreate([
  CreatorService,
  LlmService,
]);

export class Services {
  static getCreatorService(): CreatorService {
    return injector.get(CreatorService);
  }

  static getLlmService(): LlmService {
    return injector.get(LlmService);
  }
}
