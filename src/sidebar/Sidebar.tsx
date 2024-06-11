// src/sidebar/Sidebar.tsx
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

const vscode = acquireVsCodeApi();

const App = () => {
  const [messages, setMessages] = React.useState<string[]>([]);
  const [userInput, setUserInput] = React.useState('');

  const sendMessage = () => {
    if (userInput.trim() === '') return;
    
    // Send message to extension
    vscode.postMessage({ type: 'sendMessage', value: userInput });

    // Update local messages (for display)
    setMessages([...messages, `You: ${userInput}`]);
    setUserInput('');
  };

  React.useEffect(() => {
    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.type === 'receiveMessage') {
        setMessages([...messages, `Creator AI: ${message.value}`]);
      }
    });
  }, [messages]);

  return (
    <div>
      <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
        {messages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
      <div style={{ display: 'flex', marginTop: '10px' }}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          style={{ flex: 1, padding: '5px', border: '1px solid #ccc' }}
        />
        <button onClick={sendMessage} style={{ padding: '5px 10px', background: 'blue', color: 'white', border: 'none' }}>
          Send
        </button>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
