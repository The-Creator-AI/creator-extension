import {
  KeyPaths,
  KeyPathValue,
  setNestedValue,
} from "../../../utils/key-path";
import { initialState } from "./change-plan-view.initial-state";
import { ChangePlanViewStore } from "./change-plan-view.state-type";
import { changePlanViewStoreStateSubject } from "./change-plan-view.store";

export const resetChangePlanViewStore = () => {
  changePlanViewStoreStateSubject._next(
    initialState,
    "Change Plan View : RESET"
  );
};

export const setChangePlanViewState =
  <Key extends KeyPaths<ChangePlanViewStore>>(keyPath: Key) =>
  (value: KeyPathValue<Key, ChangePlanViewStore>) => {
    changePlanViewStoreStateSubject._next(
      {
        ...setNestedValue(
          changePlanViewStoreStateSubject.getValue(),
          keyPath,
          value
        ),
      },
      `Change Plan View : SET ${keyPath}`
    );
  };
