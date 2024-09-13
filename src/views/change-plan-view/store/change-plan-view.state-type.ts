import { ChangePlanSteps } from "../change-plan-view.types";

export interface ChangePlanViewStore {
  changeDescription: string;
  isLoading: boolean;
  llmResponse: string;
  currentStep: ChangePlanSteps;
  selectedFiles: string[];
}
