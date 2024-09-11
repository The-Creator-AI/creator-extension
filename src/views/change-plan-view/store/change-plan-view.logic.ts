import { ChangePlanSteps } from "../change-plan-view.types";
import { ChangePlanViewActions } from "./change-plan-view.actions";
import { initialState } from "./change-plan-view.initial-state";
import { changePlanViewStoreStateSubject } from "./change-plan-view.store";

export const resetChangePlanViewStore = () => {
  changePlanViewStoreStateSubject._next(
    initialState,
    ChangePlanViewActions.RESET_CODE_CHAT_STORE
  );
};

export const setChangeDescription = (changeDescription: string) => {
  changePlanViewStoreStateSubject._next(
    {
      ...changePlanViewStoreStateSubject.getValue(),
      changeDescription,
    },
    ChangePlanViewActions.SET_CHANGE_DESCRIPTION
  );
};

export const setIsLoading = (isLoading: boolean) => {
  changePlanViewStoreStateSubject._next(
    {
      ...changePlanViewStoreStateSubject.getValue(),
      isLoading,
    },
    ChangePlanViewActions.SET_IS_LOADING
  );
};

export const setLlmResponse = (llmResponse: string) => {
  changePlanViewStoreStateSubject._next(
    {
      ...changePlanViewStoreStateSubject.getValue(),
      llmResponse,
    },
    ChangePlanViewActions.SET_LLM_RESPONSE
  );
};

export const setCurrentStep = (currentStep: ChangePlanSteps) => {
  changePlanViewStoreStateSubject._next(
    {
      ...changePlanViewStoreStateSubject.getValue(),
      currentStep,
    },
    ChangePlanViewActions.SET_CURRENT_STEP
  );
};
