import { ChangePlanSteps } from "../change-plan-view.types";
import { ChatMessage } from "../../../backend/repositories/chat.respository";

export interface ChangePlanViewStore {
  changeDescription: string;
  isLoading: boolean;
  llmResponse: string;
  currentStep: ChangePlanSteps;
  selectedFiles: string[];
  chatHistory: ChatMessage[];
}
