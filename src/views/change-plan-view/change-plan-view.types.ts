export enum ChangePlanSteps {
  FileExplorer = 'FileExplorer',
  ChangeInput = 'ChangeInput',
  LlmResponse = 'LlmResponse',
}

export type ChangePlanStepsConfig = {
  [key in ChangePlanSteps]: {
    indicatorText: string;
    renderStep: () => JSX.Element;
  };
};
