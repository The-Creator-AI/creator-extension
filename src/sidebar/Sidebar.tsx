import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

const App = () => {
  const vscode = acquireVsCodeApi();
  const oldState: any = vscode.getState() || { colors: [] };
  console.log({ vscode, oldState });
  vscode.setState({ colors: [...oldState.colors, 'red'] });
  vscode.postMessage({ type: 'fromClient', value: 'blue' });

  React.useEffect(() => {
    window.addEventListener('message', (event) => {
      const message = event.data;
      console.log({ message });
    });
  }, []);

  return (
    <h1>Hello from React in VS Code!</h1>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />); 
