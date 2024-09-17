import * as vscode from "vscode";
import { ServerPostMessageManager } from "../ipc/server-ipc";
import { getNonce } from "./nonce";
import { views } from "./views";

export const serverIPCs: Record<string, ServerPostMessageManager> = {};
// Map to store existing panel views by view type
const existingPanels: Map<string, vscode.WebviewPanel> = new Map();

export function registerViews(context: vscode.ExtensionContext) {
  views.forEach((viewConfig) => {
    if (viewConfig.target === "sidebar") {
      // Register sidebar view
      context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(viewConfig.type, {
          resolveWebviewView: (webviewView, _, token) => {
            webviewView.webview.options = {
              enableScripts: true,
              localResourceRoots: [context.extensionUri],
            };

            const nonce = getNonce();
            webviewView.webview.html = viewConfig.getHtml(
              webviewView.webview,
              nonce,
              context.extensionUri
            );

            const serverIpc = ServerPostMessageManager.getInstance(
              webviewView.webview.onDidReceiveMessage,
              (data: any) => webviewView.webview.postMessage(data)
            );

            serverIPCs[viewConfig.type] = serverIpc;

            viewConfig.handleMessage(serverIpc);
          },
        })
      );
    } else if (viewConfig.target === "panel") {
      // Register panel view
      context.subscriptions.push(
        vscode.commands.registerCommand(`${viewConfig.type}.open`, () => {
          // Check if a panel with the same view type already exists
          const existingPanel = existingPanels.get(viewConfig.type);
          if (existingPanel) {
            // If an existing panel is found, reveal it
            existingPanel.reveal(vscode.ViewColumn.One);
            return;
          }

          // If no existing panel is found, create a new panel
          const panel = vscode.window.createWebviewPanel(
            viewConfig.type, // Identifies the type of the webview. Used internally
            viewConfig.title || "", // Title of the panel displayed to the user
            vscode.ViewColumn.One, // Editor column to show the new webview panel in.
            {
              enableScripts: true,
              localResourceRoots: [context.extensionUri],
            }
          );
          const nonce = getNonce();
          panel.webview.html = viewConfig.getHtml(
            panel.webview,
            nonce,
            context.extensionUri
          );

          const serverIpc = ServerPostMessageManager.getInstance(
            panel.webview.onDidReceiveMessage,
            (data: any) => panel.webview.postMessage(data)
          );

          serverIPCs[viewConfig.type] = serverIpc;

          viewConfig.handleMessage(serverIpc);

          // Store the new panel in the map
          existingPanels.set(viewConfig.type, panel);

          // Remove the panel from the map when it is disposed
          panel.onDidDispose(() => {
            existingPanels.delete(viewConfig.type);
          });
        })
      );
    }
  });
}
