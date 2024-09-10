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
    <div className="sidebar-container">
      {!showResponse && ( // Conditionally render input section
        <div className="change-description-input">
          <textarea
            placeholder="Describe the code changes you want to plan..."
            value={changeDescription}
            onChange={(e) => setChangeDescription(e.target.value)}
            disabled={isLoading} // Disable input when loading
          />
          <button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Submit'}
          </button>
        </div>
      )}

      {isLoading && (
        <div className="loader">
          <FaSpinner className="spinner" />
        </div>
      )}

      {showResponse && ( // Conditionally render response section
        <div className="response-section">
          <div className="response-header">
            <button className="back-button" onClick={handleGoBack}>
              <FaArrowLeft /> {/* Back icon */}
            </button>
          </div>
          <div className="response">
            {llmResponse}
          </div>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('change-plan-view-root')!);
root.render(<App />);
