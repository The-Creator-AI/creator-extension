import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import './index.scss';
import { ClientPostMessageManager } from '../../ipc/client-ipc';
import { ClientToServerChannel, ServerToClientChannel } from '../../ipc/channels.enum';
import { FaSpinner } from 'react-icons/fa'; // Import spinner icon
import Markdown from 'markdown-to-jsx';

const App = () => {
  const [changeDescription, setChangeDescription] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [llmResponse, setLlmResponse] = React.useState('');
  const [currentStep, setCurrentStep] = React.useState(0); // Track current step (0 for input, 1 for response)
  const clientIpc = ClientPostMessageManager.getInstance();

  const handleSubmit = () => {
    setIsLoading(true);
    clientIpc.sendToServer(ClientToServerChannel.SendMessage, { message: changeDescription });
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  React.useEffect(() => {
    clientIpc.onServerMessage(ServerToClientChannel.SendMessage, ({ message }) => {
      setIsLoading(false);
      setLlmResponse(message);
      setCurrentStep(1); // Switch to response step after receiving LLM response
    });
  }, []);

  const renderStepIndicators = () => (
    <div className="flex items-center justify-between w-full mb-4 pl-16 pr-16 pt-4 pb-8">
      <div className="flex flex-col items-center" onClick={() => handleStepClick(0)}>
        <div className={`w-4 h-4 rounded-full ${currentStep === 0 ? 'bg-blue-500' : 'bg-gray-300'} cursor-pointer relative`} >
          <span className={`text-xs mt-4 whitespace-nowrap ${currentStep === 0 ? 'text-blue-500' : 'text-gray-500'} absolute top-full left-1/2 -translate-x-1/2`}>
            Change Input
          </span>
        </div>
      </div>
      <div className="flex-grow border-t border-gray-300"></div>
      <div className="flex flex-col items-center" onClick={() => handleStepClick(1)}>
        <div className={`w-4 h-4 rounded-full ${currentStep === 1 ? 'bg-blue-500' : 'bg-gray-300'} cursor-pointer relative`} >
          <span className={`text-xs mt-4 whitespace-nowrap ${currentStep === 1 ? 'text-blue-500' : 'text-gray-500'} absolute top-full left-1/2 -translate-x-1/2`}>
            LLM Response
          </span>
        </div>
      </div>
    </div>
  );

  const renderChangeInput = () => (
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
  );

  const renderLoader = () => (
    <div className="loader flex justify-center items-center h-[100px]">
      <FaSpinner className="spinner text-2xl animate-spin" />
    </div>
  );

  const renderLlmResponse = () => (
    <div className="p-4">
      <div className="p-4 border-t border-gray-300">
        <Markdown>{llmResponse}</Markdown>
      </div>
    </div>
  );

  return (
    <div className="h-full">
      {renderStepIndicators()}
      {currentStep === 0 && renderChangeInput()}
      {isLoading && renderLoader()}
      {currentStep === 1 && renderLlmResponse()}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('change-plan-view-root')!);
root.render(<App />);
