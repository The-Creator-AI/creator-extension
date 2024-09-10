import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import './index.scss';
import { ClientPostMessageManager } from '../../ipc/client-ipc';
import { ClientToServerChannel, ServerToClientChannel } from '../../ipc/channels.enum';
import { FaSpinner } from 'react-icons/fa'; // Import spinner icon
import Markdown from 'markdown-to-jsx';

// Define the enum for the steps
enum ChangePlanSteps {
  ChangeInput,
  LlmResponse,
}

const App = () => {
  const [changeDescription, setChangeDescription] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [llmResponse, setLlmResponse] = React.useState('');
  const [currentStep, setCurrentStep] = React.useState(ChangePlanSteps.ChangeInput); // Track current step using the enum
  const clientIpc = ClientPostMessageManager.getInstance();

  const changePlanStepsConfig: {
    [key in ChangePlanSteps]: {
      indicatorText: string;
      renderContent: () => JSX.Element;
    };
  } = {
    [ChangePlanSteps.ChangeInput]: {
      indicatorText: 'Change Input',
      renderContent: () => (
        <div className="p-4 flex flex-col grow">
          <textarea
            className="grow p-2 border border-gray-300 rounded resize-y font-normal mb-2 min-h-[50px] max-h-[200px] overflow-hidden"
            placeholder="Describe the code changes you want to plan..."
            value={changeDescription}
            onChange={(e) => setChangeDescription(e.target.value)}
            disabled={isLoading}
          />
          <button
            className="py-2 px-4 bg-blue-500 text-white rounded cursor-pointer self-end hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Submit'}
          </button>
        </div>
      ),
    },
    [ChangePlanSteps.LlmResponse]: {
      indicatorText: 'LLM Response',
      renderContent: () => (
        <div className="p-4">
          <div className="p-4 border-t border-gray-300">
            <Markdown>{llmResponse}</Markdown>
          </div>
        </div>
      ),
    },
  };

  const handleSubmit = () => {
    setIsLoading(true);
    clientIpc.sendToServer(ClientToServerChannel.SendMessage, { message: changeDescription });
  };

  const handleStepClick = (step: ChangePlanSteps) => {
    setCurrentStep(step);
  };

  React.useEffect(() => {
    clientIpc.onServerMessage(ServerToClientChannel.SendMessage, ({ message }) => {
      setIsLoading(false);
      setLlmResponse(message);
      setCurrentStep(ChangePlanSteps.LlmResponse); // Switch to response step using the enum
    });
  }, []);

  const renderStepIndicators = () => {
    const steps = Object.keys(ChangePlanSteps).filter(key => !isNaN(Number(key)));
    return <div className="flex items-center justify-between w-full mb-4 pl-16 pr-16 pt-4 pb-8">
      {steps.map((step: any, index: number) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center" onClick={() => handleStepClick(step)}>
            <div
              className={`w-4 h-4 rounded-full ${currentStep === step ? 'bg-blue-500' : 'bg-gray-300'} cursor-pointer relative`}
            >
              <span
                className={`text-xs mt-4 whitespace-nowrap ${currentStep === step ? 'text-blue-500' : 'text-gray-500'
                  } absolute top-full left-1/2 -translate-x-1/2`}
              >
                {changePlanStepsConfig[step]?.indicatorText} {/* Use indicator text from config */}
              </span>
            </div>
          </div>
          {index < steps.length - 1 && <div className="flex-grow border-t border-gray-300"></div>}
        </React.Fragment>
      ))}
    </div>;
  };

  const renderLoader = () => (
    <div className="loader flex justify-center items-center h-[100px]">
      <FaSpinner className="spinner text-2xl animate-spin" />
    </div>
  );

  return (
    <div className="h-full">
      {renderStepIndicators()}
      {changePlanStepsConfig[currentStep].renderContent()} {/* Render content based on config */}
      {isLoading && renderLoader()}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('change-plan-view-root')!);
root.render(<App />);
