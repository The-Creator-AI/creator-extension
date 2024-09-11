import { ChangePlanViewStore } from "./store/change-plan-view.state-type";

export enum ChangePlanSteps {
  ChangeInput,
  LlmResponse,
}

export type KeyPaths<T> = T extends object
  ? {
      [K in keyof Required<T>]: `${Exclude<K, symbol>}${
        | ""
        | (Required<T>[K] extends Array<infer U>
            ? ""
            : Required<T>[K] extends object
            ? `.${KeyPaths<Required<T>[K]>}`
            : "")}`;
    }[keyof T]
  : "";
  
export type KeyPathValue<KeyPath> = KeyPath extends `${infer K}.${infer Rest}`
  ? K extends keyof ChangePlanViewStore
    ? KeyPathValue<Rest>
    : never
  : KeyPath extends keyof ChangePlanViewStore
  ? ChangePlanViewStore[KeyPath]
  : never;
