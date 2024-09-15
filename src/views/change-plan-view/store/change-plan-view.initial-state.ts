import { ChangePlanViewStore } from "./change-plan-view.state-type";
import { ChangePlanSteps } from "../change-plan-view.types";

export const initialState: ChangePlanViewStore = {
  changeDescription: "",
  isLoading: false,
  llmResponse: "",
  currentStep: ChangePlanSteps.Plan,
  selectedFiles: [],
  chatHistory: [],
  activeTab: undefined,
  changePlans: [], // Initialize changePlans with an empty array
  commitSuggestions: [], // Add initial state for commit message suggestions
  commitSuggestionsLoading: false // Add initial state for commit loading state
};