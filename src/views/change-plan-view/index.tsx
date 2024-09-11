import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { FaSpinner } from 'react-icons/fa'; // Import spinner icon
import { ClientToServerChannel, ServerToClientChannel } from '../../ipc/channels.enum';
import { ClientPostMessageManager } from '../../ipc/client-ipc';
import { useStore } from "../../store/useStore";
import { ChangePlanSteps } from './change-plan-view.types';
import ChangeInputStep from './components/change-input-step';
import LlmResponseStep from './components/llm-response-step';
import StepIndicators from './components/step-indicators';
import './index.scss';
import {
  setChangePlanViewState
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

  const handleSubmit = () => {
    setChangePlanViewState('isLoading')(true);
    clientIpc.sendToServer(ClientToServerChannel.SendMessage, { message: changeDescription });
  };

  const handleStepClick = (step: ChangePlanSteps) => {
    setChangePlanViewState('currentStep')(step);
  };

  React.useEffect(() => {
    clientIpc.onServerMessage(ServerToClientChannel.SendMessage, ({ message }) => {
      setChangePlanViewState('isLoading')(false);
      setChangePlanViewState('llmResponse')(message);
      setChangePlanViewState('currentStep')(ChangePlanSteps.LlmResponse);
    });
  }, []);

  const renderLoader = () => (
    <div className="loader flex justify-center items-center h-[100px]" data-testid="loader">
      <FaSpinner className="spinner text-2xl animate-spin" />
    </div>
  );

  return (
    <div className="h-full">
      <StepIndicators currentStep={currentStep} handleStepClick={handleStepClick} />
      {currentStep === ChangePlanSteps.ChangeInput &&
        <ChangeInputStep
          changeDescription={changeDescription}
          isLoading={isLoading}
          handleChange={setChangePlanViewState('changeDescription')}
          handleSubmit={handleSubmit}
        />}
      {currentStep === ChangePlanSteps.LlmResponse && <LlmResponseStep llmResponse={llmResponse} />}
      {isLoading && renderLoader()}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('change-plan-view-root')!);
root.render(<App />);
