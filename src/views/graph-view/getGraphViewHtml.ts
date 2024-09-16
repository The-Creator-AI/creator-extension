import * as vscode from "vscode";
import { getViewHtml } from "@/utils/get-view-html";

// Function to get HTML for graph view
export function getGraphViewHtml(
  webview: vscode.Webview,
  nonce: string,
  extensionUri: vscode.Uri
): string {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "dist", "graphView.js")
  );
  return getViewHtml({
    webview,
    nonce,
    scriptUri: scriptUri.toString(),
    rootId: "graph-view-root",
  });
}
