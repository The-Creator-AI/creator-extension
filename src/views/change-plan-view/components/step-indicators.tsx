import * as React from 'react';
import { ChangePlanSteps } from '../change-plan-view.types';
import '../index.scss';

interface StepIndicatorsProps {
    currentStep: ChangePlanSteps;
    handleStepClick: (step: ChangePlanSteps) => void;
}

const StepIndicators: React.FC<StepIndicatorsProps> = ({ currentStep, handleStepClick }) => {
    const changePlanStepsConfig: {
        [key in ChangePlanSteps]: {
            indicatorText: string;
        };
    } = {
        [ChangePlanSteps.ChangeInput]: {
            indicatorText: 'Change Input',
        },
        [ChangePlanSteps.LlmResponse]: {
            indicatorText: 'LLM Response',
        },
    };

    const steps = Object.keys(ChangePlanSteps).filter(key => !isNaN(Number(key)));

    return (
        <div className="flex items-center justify-between w-full mb-4 pl-16 pr-16 pt-4 pb-8">
            {steps.map((step: any, index: number) => (
                <React.Fragment key={step}>
                    <div className="flex flex-col items-center" onClick={() => handleStepClick(Number(step))} data-testid={`step-indicator-${step}`}>
                        <div
                            className={`w-4 h-4 rounded-full ${currentStep === step ? 'bg-blue-500' : 'bg-gray-300'} cursor-pointer relative`}
                        >
                            <span
                                className={`text-xs mt-4 whitespace-nowrap ${currentStep === step ? 'text-blue-500' : 'text-gray-500'
                                    } absolute top-full left-1/2 -translate-x-1/2`}
                            >
                                {changePlanStepsConfig[step]?.indicatorText}
                            </span>
                        </div>
                    </div>
                    {index < steps.length - 1 && <div className="flex-grow border-t border-gray-300" data-testid="step-indicator-divider" />}
                </React.Fragment>
            ))}
        </div>
    );
};

export default StepIndicators;
