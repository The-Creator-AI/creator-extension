import { ReflectiveInjector } from "injection-js";
import "reflect-metadata";
import { CreatorService } from "./creator.service";
import { LlmService } from "./llm.service";
import { SettingsRepository } from "../repositories/settings.repository";

export class Services {
  static injector: ReflectiveInjector;

  static async initialize(): Promise<void> {
    Services.injector = ReflectiveInjector.resolveAndCreate([
      SettingsRepository,
      CreatorService,
      LlmService,
    ]);
  }

  static getCreatorService(): CreatorService {
    return Services.injector.get(CreatorService);
  }

  static getLlmService(): LlmService {
    return Services.injector.get(LlmService);
  }
}