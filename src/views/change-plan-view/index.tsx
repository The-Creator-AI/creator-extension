import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import './index.scss';
import { ClientPostMessageManager } from '../../ipc/client-ipc';
import { ClientToServerChannel, ServerToClientChannel } from '../../ipc/channels.enum';
import { FaSpinner, FaArrowLeft } from 'react-icons/fa'; // Import back icon

const App = () => {
  const [changeDescription, setChangeDescription] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [llmResponse, setLlmResponse] = React.useState('');
  const [showResponse, setShowResponse] = React.useState(false); // Track response visibility
  const clientIpc = ClientPostMessageManager.getInstance();

  const handleSubmit = () => {
    setIsLoading(true);
    setShowResponse(false); // Hide response initially
    clientIpc.sendToServer(ClientToServerChannel.SendMessage, { message: changeDescription });
  };

  const handleGoBack = () => {
    setShowResponse(false); // Show input section again
    setLlmResponse(''); // Clear the previous response
  };

  React.useEffect(() => {
    clientIpc.onServerMessage(ServerToClientChannel.SendMessage, ({ message }) => {
      setIsLoading(false);
      setLlmResponse(message);
      setShowResponse(true); // Show response section
    });
  }, []);

  return (
    <div className="h-full">
      {!showResponse && ( // Conditionally render input section
        <div className="p-4 flex flex-col grow">
          <textarea
            className="grow p-2 border border-gray-300 rounded resize-y font-normal mb-2 min-h-[50px] max-h-[200px] overflow-hidden"
            placeholder="Describe the code changes you want to plan..."
            value={changeDescription}
            onChange={(e) => setChangeDescription(e.target.value)}
            disabled={isLoading} // Disable input when loading
          />
          <button
            className="py-2 px-4 bg-blue-500 text-white rounded cursor-pointer self-end hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Submit'}
          </button>
        </div>
      )}

      {isLoading && (
        <div className="loader flex justify-center items-center h-[100px]">
          <FaSpinner className="spinner text-2xl animate-spin" />
        </div>
      )}

      {showResponse && ( // Conditionally render response section
        <div className="flex flex-col p-4">
          <div className="flex justify-start items-center mb-2">
            <button className="text-lg cursor-pointer mr-2 hover:opacity-80" onClick={handleGoBack}>
              <FaArrowLeft /> {/* Back icon */}
            </button>
          </div>
          <div className="p-4 border-t border-gray-300">
            {llmResponse}
          </div>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('change-plan-view-root')!);
root.render(<App />);
