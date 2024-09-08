import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ClientPostMessageManager } from '../../../ipc/client-ipc';
import { ClientToServerChannel, ServerToClientChannel } from '../../../ipc/channels.enum';
import './index.scss';
import * as vscode from 'vscode';

interface EditorInfo {
  fileName: string;
  filePath: string;
  languageId: string;
}

const App = () => {
  const [editors, setEditors] = React.useState<EditorInfo[]>([]);
  const clientIpc = ClientPostMessageManager.getInstance();

  React.useEffect(() => {
    // Request open editors from extension
    clientIpc.sendToServer(ClientToServerChannel.RequestOpenEditors, {});

    // Listen for open editors response
    clientIpc.onServerMessage(ServerToClientChannel.SendOpenEditors, ({ editors }) => {
      setEditors(editors);
    });
  }, []);

  const handleEditorClick = (editor: EditorInfo) => {
    // Send selected editor to extension
    clientIpc.sendToServer(ClientToServerChannel.SendSelectedEditor, { editor });
  };

  return (
    <div className="sidebar-container">
      <div className="editors-list">
        <h3>Open Editors</h3>
        <ul>
          {editors.map((editor) => (
            <li key={editor.filePath} onClick={() => handleEditorClick(editor)}>
              <span className="file-name">{editor.fileName}</span>
              <span className="file-path">{editor.filePath}</span>
              {editor.languageId && <span className="language-id">({editor.languageId})</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('change-plan-view-root')!);
root.render(<App />);
