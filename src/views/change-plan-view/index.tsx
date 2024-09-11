import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { FaSpinner } from 'react-icons/fa'; // Import spinner icon
import { ClientToServerChannel, ServerToClientChannel } from '../../ipc/channels.enum';
import { ClientPostMessageManager } from '../../ipc/client-ipc';
import { useStore } from "../../store/useStore";
import { ChangePlanSteps, ChangePlanStepsConfig } from './change-plan-view.types';
import ChangeInputStep from './components/change-input-step';
import LlmResponseStep from './components/llm-response-step';
import StepIndicators from './components/step-indicators';
import './index.scss';
import {
  setChangePlanViewState as setState
} from "./store/change-plan-view.logic";
import { changePlanViewStoreStateSubject } from "./store/change-plan-view.store";

const App = () => {
  const {
    changeDescription,
    isLoading,
    llmResponse,
    currentStep,
  } = useStore(changePlanViewStoreStateSubject);

  const clientIpc = ClientPostMessageManager.getInstance();

  const changePlanStepsConfig: ChangePlanStepsConfig = {
    [ChangePlanSteps.FileExplorer]: {
      indicatorText: 'File Explorer',
      renderStep: () => <div>File Explorer</div>,
    },
    [ChangePlanSteps.ChangeInput]: {
      indicatorText: 'Change Input',
      renderStep: () => (
        <ChangeInputStep
          changeDescription={changeDescription}
          isLoading={isLoading}
          handleChange={setState('changeDescription')}
          handleSubmit={handleSubmit}
        />
      ),
    },
    [ChangePlanSteps.LlmResponse]: {
      indicatorText: 'LLM Response',
      renderStep: () => <LlmResponseStep llmResponse={llmResponse} />,
    },
  };

  const handleSubmit = () => {
    setState('isLoading')(true);
    clientIpc.sendToServer(ClientToServerChannel.SendMessage, { message: changeDescription });
  };

  const handleStepClick = (step: ChangePlanSteps) => {
    setState('currentStep')(step);
  };

  React.useEffect(() => {
    clientIpc.onServerMessage(ServerToClientChannel.SendMessage, ({ message }) => {
      setState('isLoading')(false);
      setState('llmResponse')(message);
      setState('currentStep')(ChangePlanSteps.LlmResponse);
    });
  }, []);

  const renderLoader = () => (
    <div className="loader flex justify-center items-center h-[100px]" data-testid="loader">
      <FaSpinner className="spinner text-2xl animate-spin" />
    </div>
  );

  const steps = Object.keys(ChangePlanSteps).filter(key => !isNaN(Number(key)));
  return (
    <div className="h-full">
      <StepIndicators changePlanStepsConfig={changePlanStepsConfig} currentStep={currentStep} handleStepClick={handleStepClick} />
      {changePlanStepsConfig[currentStep].renderStep()}
      {isLoading && renderLoader()}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('change-plan-view-root')!);
root.render(<App />);
