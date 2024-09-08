import * as vscode from "vscode";
import { ServerPostMessageManager } from "../../ipc/server-ipc";
import { getNonce } from "../nonce";
import { getChatViewHtml, handleChatViewMessages } from "./chat-view/chat-view";
import {
  getFileExplorerViewHtml,
  handleFileExplorerViewMessages,
} from "./file-explorer-view/file-explorer-view";
import { VIEW_TYPES } from "../view-types";
import {
  getChangePlanViewHtml,
  handleChangePlanViewMessages,
} from "./change-plan-view/change-plan-view"; // Import the new view's functions

// Main function to resolve the webview view
export function resolveWebviewView(
  webviewView: vscode.WebviewView,
  context: vscode.ExtensionContext,
  _token: vscode.CancellationToken,
  extensionUri: vscode.Uri
) {
  webviewView.webview.options = {
    enableScripts: true,
    localResourceRoots: [extensionUri],
  };

  const nonce = getNonce();

  // Conditional rendering and message handling based on view type
  switch (webviewView.viewType) {
    case VIEW_TYPES.SIDEBAR.CHAT:
      webviewView.webview.html = getChatViewHtml(
        webviewView.webview,
        nonce,
        extensionUri
      );
      const chatViewServerIpc = ServerPostMessageManager.getInstance(
        webviewView.webview.onDidReceiveMessage,
        (data: any) => webviewView.webview.postMessage(data)
      );
      handleChatViewMessages(chatViewServerIpc);
      break;
    case VIEW_TYPES.SIDEBAR.FILE_EXPLORER:
      webviewView.webview.html = getFileExplorerViewHtml(
        webviewView.webview,
        nonce,
        extensionUri
      );
      const fileExplorerViewServerIpc = ServerPostMessageManager.getInstance(
        webviewView.webview.onDidReceiveMessage,
        (data: any) => webviewView.webview.postMessage(data)
      );
      handleFileExplorerViewMessages(fileExplorerViewServerIpc);
      break;
    case VIEW_TYPES.SIDEBAR.CHANGE_PLAN: // Handle the new view type
      webviewView.webview.html = getChangePlanViewHtml(
        webviewView.webview,
        nonce,
        extensionUri
      );
      const changePlanViewServerIpc = ServerPostMessageManager.getInstance(
        webviewView.webview.onDidReceiveMessage,
        (data: any) => webviewView.webview.postMessage(data)
      );
      handleChangePlanViewMessages(changePlanViewServerIpc);
      break;
    default:
      webviewView.webview.html = "Unknown view type";
  }
}
