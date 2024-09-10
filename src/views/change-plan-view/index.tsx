import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import './index.scss';
import { ClientPostMessageManager } from '../../ipc/client-ipc';
import { ClientToServerChannel, ServerToClientChannel } from '../../ipc/channels.enum';
import { FaSpinner } from 'react-icons/fa';

const App = () => {
  const [changeDescription, setChangeDescription] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [llmResponse, setLlmResponse] = React.useState('');
  const clientIpc = ClientPostMessageManager.getInstance();

  const handleSubmit = () => {
    setIsLoading(true);
    clientIpc.sendToServer(ClientToServerChannel.SendMessage, { message: changeDescription });
  };

  React.useEffect(() => {
    clientIpc.onServerMessage(ServerToClientChannel.SendMessage, ({ message }) => {
      setIsLoading(false);
      setLlmResponse(message);
    });
  }, []);

  return (
    <div className="sidebar-container">
      <div className="change-description-input">
        <textarea
          placeholder="Describe the code changes you want to plan..."
          value={changeDescription}
          onChange={(e) => setChangeDescription(e.target.value)}
        />
        <button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Submit'}
        </button>
      </div>

      {isLoading && (
        <div className="loader">
          <FaSpinner className="spinner" />
        </div>
      )}

      {llmResponse && !isLoading && (
        <div className="response">
          {llmResponse}
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('change-plan-view-root')!);
root.render(<App />);
