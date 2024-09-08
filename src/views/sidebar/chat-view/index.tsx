// creator-extension/src/sidebar/Sidebar.tsx
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ClientPostMessageManager } from '../../../ipc/client-ipc';
import { ClientToServerChannel, ServerToClientChannel } from '../../../ipc/channels.enum';
// import ReactMarkdown from 'react-markdown';
import Markdown from 'markdown-to-jsx'
import { FaUser, FaRobot } from 'react-icons/fa';
import './index.scss';

const App = () => {
  const [messages, setMessages] = React.useState<{ user: string; message: string }[]>([]);
  const [userInput, setUserInput] = React.useState('');
  const clientIpc = ClientPostMessageManager.getInstance();

  const sendMessage = () => {
    if (userInput.trim() === '') return;

    // Send message to extension
    clientIpc.sendToServer(ClientToServerChannel.SendMessage, { message: userInput });

    // Update local messages (for display)
    setMessages([...messages, { user: 'You', message: userInput }]);
    setUserInput('');
  };

  React.useEffect(() => {
    clientIpc.onServerMessage(ServerToClientChannel.SendMessage, ({ message }) => {
      setMessages((messages) => ([...messages, { user: 'Creator AI', message }]));
    });
    clientIpc.onServerMessage(ServerToClientChannel.SendChatHistory, ({ messages }) => {
      setMessages(() => ([...messages]));
    });
    clientIpc.sendToServer(ClientToServerChannel.RequestChatHistory, {});
  }, []);

  return (
    <div className="sidebar-container">
      {/* {JSON.stringify(messages, null, 2)} */}
      <div className="chat-history">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.user === 'user' ? 'user' : 'bot'}`}>
            <div className="message-icon">
              {message.user === 'user' ? <FaUser /> : <FaRobot />}
            </div>
            {/* <div className="message-content">
              <ReactMarkdown>{message.message}</ReactMarkdown>
            </div> */}
            {/* {message.message} */}
            <Markdown>{message.message}</Markdown>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message here"
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('chat-view-root')!);
root.render(<App />);

