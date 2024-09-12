import { ChangePlanViewStore } from "./change-plan-view.state-type";
import { ChangePlanSteps } from "../change-plan-view.types";

export const initialState: ChangePlanViewStore = {
  changeDescription: "",
  isLoading: false,
  llmResponse: "",
  currentStep: ChangePlanSteps.FileExplorer,
};
