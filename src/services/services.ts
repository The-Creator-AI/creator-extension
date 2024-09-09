// src/services.ts
import { CreatorService } from './creator.service';
import { LlmService } from './llm.service';

export class Services {
    private static _creatorService: CreatorService | undefined;
    private static _llmService: LlmService | undefined;

    static getCreatorService(): CreatorService {
        if (!this._creatorService) {
            this._creatorService = new CreatorService();
        }
        return this._creatorService;
    }

    static getLlmService(): LlmService {
        if (!this._llmService) {
            this._llmService = new LlmService(this.getCreatorService());
        }
        return this._llmService;
    }
}
