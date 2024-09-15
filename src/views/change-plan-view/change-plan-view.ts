import * as vscode from "vscode";
import {
  ClientToServerChannel
} from "../../ipc/channels.enum";
import { ServerPostMessageManager } from "../../ipc/server-ipc";
import { getViewHtml } from "../../utils/get-view-html";
import { handleFileCodeUpdate } from "./utils/handleFileCodeUpdate";
import { handleFileOpen } from "./utils/handleFileOpen";
import { handleSendMessage } from "./utils/handleSendMessage";
import { handleWorkspaceFilesRequest } from "./utils/handleWorkspaceFilesRequest";
import { handleActiveTabChange } from "./utils/handleActiveTabChange";

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

  serverIpc.onClientMessage(
    ClientToServerChannel.RequestOpenFile,
    async (data) => {
      handleFileOpen(data);
    }
  );

  handleActiveTabChange(serverIpc);
}
