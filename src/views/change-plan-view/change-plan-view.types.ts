export enum ChangePlanSteps {
  Context = 'Context',
  Plan = 'Plan',
  Commit = 'Commit', // Add a new enum value for the Commit step
}

export type ChangePlanStepsConfig = {
  [key in ChangePlanSteps]: {
    indicatorText: string;
    renderStep: () => JSX.Element;
  };
};