import { Store } from "../../../store/store";
import { ChangePlanViewActions } from "./change-plan-view.actions";
import { ChangePlanViewStore } from "./change-plan-view.state-type";
import { initialState } from "./change-plan-view.initial-state";

export const changePlanViewStoreStateSubject = new Store<
  ChangePlanViewStore,
  ChangePlanViewActions
>(initialState);

export const getChangePlanViewStore = () =>
  changePlanViewStoreStateSubject.getValue();
