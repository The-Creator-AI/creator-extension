import * as vscode from "vscode";
import { ClientToServerChannel } from "../../ipc/channels.enum";
import { ServerPostMessageManager } from "../../ipc/server-ipc";
import { handleFileCodeUpdate } from "./utils/handleFileCodeUpdate";
import { handleSendMessage } from "./utils/handleSendMessage";
import { handleWorkspaceFilesRequest } from "./utils/handleWorkspaceFilesRequest";
import { getViewHtml } from "../../utils/get-view-html";

// Function to get HTML for change plan view
export function getChangePlanViewHtml(
  webview: vscode.Webview,
  nonce: string,
  extensionUri: vscode.Uri
): string {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "dist", "changePlanView.js")
  );
  return getViewHtml({ webview, nonce, scriptUri: scriptUri.toString() });
}

// Function to handle messages for the change plan view
export function handleChangePlanViewMessages(
  serverIpc: ServerPostMessageManager
) {
  serverIpc.onClientMessage(ClientToServerChannel.RequestWorkspaceFiles, () =>
    handleWorkspaceFilesRequest(serverIpc)
  );

  serverIpc.onClientMessage(ClientToServerChannel.RequestFileCode, (data) =>
    handleFileCodeUpdate(serverIpc, data)
  );

  serverIpc.onClientMessage(ClientToServerChannel.SendMessage, (data) =>
    handleSendMessage(serverIpc, data)
  );

  serverIpc.onClientMessage(ClientToServerChannel.RequestOpenFile, async (data) => {
    const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath; 

    if (workspacePath && data.filePath) {
      const fullFilePath = `${workspacePath}/${data.filePath}`; 
      const fileUri = vscode.Uri.file(fullFilePath);

      try {
        await vscode.window.showTextDocument(fileUri);
      } catch (error) {
        console.error("Failed to open file:", error);
        // Optionally, send an error message back to the client.
      }
    } else {
      console.error("Workspace path or file path not available.");
      // Optionally, send an error message back to the client.
    }
  });
}