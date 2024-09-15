import * as vscode from "vscode";
import { ServerToClientChannel } from "../../../ipc/channels.enum";
import { ServerPostMessageManager } from "../../../ipc/server-ipc";

/**
 * Handles active tab changes in VS Code and sends the active file path to the server.
 *
 * @param serverIpc - The server IPC instance used to send messages to the server.
 */
export const handleActiveTabChange = (serverIpc: ServerPostMessageManager) => {
  serverIpc.sendToClient(ServerToClientChannel.SendActiveTab, {
    filePath: vscode.window.activeTextEditor?.document.fileName,
  });
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor) {
      serverIpc.sendToClient(ServerToClientChannel.SendActiveTab, {
        filePath: editor.document.fileName,
      });
    }
  });
};
