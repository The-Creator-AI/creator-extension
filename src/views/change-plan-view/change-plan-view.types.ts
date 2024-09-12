export enum ChangePlanSteps {
  Context = 'Context',
  Plan = 'Plan',
}

export type ChangePlanStepsConfig = {
  [key in ChangePlanSteps]: {
    indicatorText: string;
    renderStep: () => JSX.Element;
  };
};
