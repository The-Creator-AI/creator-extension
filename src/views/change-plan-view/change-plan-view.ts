import * as vscode from "vscode";
import { ServerPostMessageManager } from "../../ipc/server-ipc";
import {
  ClientToServerChannel,
  ServerToClientChannel,
} from "../../ipc/channels.enum";
import { Services } from "../../services/services";
import {
  createFileTree,
  getFilesRespectingGitignore,
} from "../../services/workspace-files.utils";

// Function to get HTML for change plan view
export function getChangePlanViewHtml(
  webview: vscode.Webview,
  nonce: string,
  extensionUri: vscode.Uri
): string {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "dist", "changePlanView.js")
  );
  return `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body>
                        <div id="change-plan-view-root"></div>
                        <script nonce="${nonce}" src="${scriptUri}"></script>
                    </body>
                    </html>`;
}

// Function to handle messages for the change plan view
export function handleChangePlanViewMessages(
  serverIpc: ServerPostMessageManager
) {
  let fileSystemWatcher: vscode.FileSystemWatcher | undefined;

  serverIpc.onClientMessage(ClientToServerChannel.SendMessage, async (data) => {
    const changeDescription = data.message;

    // Optionally, you can store the change description in ChatRepository here

    const response = await Services.getLlmService().sendPrompt([
      { user: "user", message: changeDescription },
    ]); // Assuming sendPrompt takes an array of messages

    serverIpc.sendToClient(ServerToClientChannel.SendMessage, {
      message: response,
    });
  });

  async function sendWorkspaceFiles() {
    const workspaceRoots =
      vscode.workspace.workspaceFolders?.map((folder) => folder.uri) || [];
    const files = await getFilesRespectingGitignore();
    const fileTree = createFileTree(workspaceRoots, files);

    serverIpc.sendToClient(ServerToClientChannel.SendWorkspaceFiles, {
      files: fileTree,
    });
  }

  serverIpc.onClientMessage(
    ClientToServerChannel.RequestWorkspaceFiles,
    async () => {
      await sendWorkspaceFiles();

      // Set up file system watcher if not already set
      if (!fileSystemWatcher) {
        fileSystemWatcher = vscode.workspace.createFileSystemWatcher("**/*");

        fileSystemWatcher.onDidCreate(() => sendWorkspaceFiles());
        fileSystemWatcher.onDidDelete(() => sendWorkspaceFiles());
        fileSystemWatcher.onDidChange(() => sendWorkspaceFiles());
      }
    }
  );

  // Clean up function to dispose of the file system watcher
  return () => {
    if (fileSystemWatcher) {
      fileSystemWatcher.dispose();
    }
  };
}
