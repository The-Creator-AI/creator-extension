import { Store } from "../../../store/store";
import { ChangePlanViewStore } from "./change-plan-view.state-type";
import { initialState } from "./change-plan-view.initial-state";
import { KeyPaths } from "../change-plan-view.types";

type ChangePlanViewActions =
  | `Change Plan View : SET ${KeyPaths<ChangePlanViewStore>}`
  | "Change Plan View : RESET";

export const changePlanViewStoreStateSubject = new Store<
  ChangePlanViewStore,
  ChangePlanViewActions
>(initialState);

const getNestedValue = <T>(obj: T, path?: string): any => {
  return path
    ? path.split(".").reduce((acc: any, part: string) => acc && acc[part], obj)
    : obj;
};

export const getChangePlanViewState = (
  keyPath?: KeyPaths<ChangePlanViewStore>
) => getNestedValue(changePlanViewStoreStateSubject.getValue(), keyPath);
