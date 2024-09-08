import * as vscode from "vscode";
import { ServerPostMessageManager } from "../../../ipc/server-ipc";
import {
  ClientToServerChannel,
  ServerToClientChannel,
} from "../../../ipc/channels.enum";

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
  serverIpc.onClientMessage(
    ClientToServerChannel.RequestOpenEditors,
    async () => {
      // Get the currently open editors from VS Code API
      const openEditors = vscode.window.visibleTextEditors.map((editor) => ({
        fileName: editor.document.fileName.split("/").pop() || "",
        filePath: editor.document.fileName,
        languageId: editor.document.languageId,
      }));

      // Send the list of open editors to the webview
      serverIpc.sendToClient(ServerToClientChannel.SendOpenEditors, {
        editors: openEditors,
      });
    }
  );

  serverIpc.onClientMessage(
    ClientToServerChannel.SendSelectedEditor,
    async (data) => {
      const selectedEditor = data.editor;
      console.log("Selected editor:", selectedEditor);
      // You can now use the selectedEditor information in your extension logic
    }
  );
}
