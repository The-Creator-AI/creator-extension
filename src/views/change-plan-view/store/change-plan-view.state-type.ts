import { ChangePlanSteps } from "../change-plan-view.types";
import { ChatMessage } from "../../../backend/repositories/chat.respository";

export interface ChangePlan {
  planTitle: string;
  planDescription: string;
  llmResponse: string;
  planJson: any;
  chatHistory: ChatMessage[];
  selectedFiles: string[];
  lastUpdatedAt: number;
}

export interface ChangePlanViewStore {
  changeDescription: string;
  isLoading: boolean;
  llmResponse: string;
  currentStep: ChangePlanSteps;
  selectedFiles: string[];
  chatHistory: ChatMessage[];
  activeTab: string | undefined;
  changePlans: ChangePlan[];
  fileChunkMap: Record<
    string,
    {
      isLoading: boolean;
      fileContent: string;
    }
  >;
  commitSuggestionsLoading: boolean;
  commitSuggestions: string[];
}