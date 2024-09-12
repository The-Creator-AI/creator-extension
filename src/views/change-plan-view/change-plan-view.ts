import * as vscode from "vscode";
import { ServerPostMessageManager } from "../../ipc/server-ipc";
import {
  ClientToServerChannel,
  ServerToClientChannel,
} from "../../ipc/channels.enum";
import { Services } from "../../services/services";
import { createFileTree, getFilesRespectingGitignore } from "../../services/workspace-files.utils";

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

  serverIpc.onClientMessage(
    ClientToServerChannel.RequestWorkspaceFiles,
    async (data) => {
      const files = await getFilesRespectingGitignore();
      const fileTree = createFileTree(files);

      // Use the VSCode API to retrieve workspace files
      // const files = await vscode.workspace.findFiles("**/*");

      // // Format the files into the expected response structure
      // const formattedFiles = files.map((file) => ({
      //   name: file.path.split("/").pop() || "", // Extract file name from path
      //   path: file.fsPath, // Use fsPath for the actual file path
      //   // type: vscode.workspace.fs
      //   //   .stat(file)
      //   //   .then((stat) => (stat.isDirectory() ? "directory" : "file")),
      // }));

      // const fileTypes = await Promise.all(
      //   formattedFiles.map((file) => file.type)
      // );
      // Send the files back to the client
      serverIpc.sendToClient(ServerToClientChannel.SendWorkspaceFiles, {
        // files: formattedFiles.map((file, index) => ({
        //   ...file,
        //   // type: fileTypes[index],
        //   type: 'file'
        // })),
        files: [fileTree]
      });
    }
  );
}
