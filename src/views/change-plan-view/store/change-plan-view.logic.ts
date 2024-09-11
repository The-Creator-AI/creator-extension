import { KeyPaths, KeyPathValue } from "../change-plan-view.types";
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
  <Key extends KeyPaths<ChangePlanViewStore>>(key: Key) =>
  (value: KeyPathValue<Key>) => {
    changePlanViewStoreStateSubject._next(
      {
        ...key.split(".").reduce(
          (acc, part, index, arr) => {
            if (index === arr.length - 1) {
              acc[part] = value;
            }
            return acc;
          },
          { ...changePlanViewStoreStateSubject.getValue() }
        ),
      },
      `Change Plan View : SET ${key}`
    );
  };
