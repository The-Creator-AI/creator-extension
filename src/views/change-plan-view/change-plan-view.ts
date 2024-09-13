import * as vscode from "vscode";
import {
  ClientToServerChannel,
  ServerToClientChannel,
} from "../../ipc/channels.enum";
import { ServerPostMessageManager } from "../../ipc/server-ipc";
import { Services } from "../../services/services";
import {
  createFileTree,
  getFilesRespectingGitignore,
} from "../../services/workspace-files.utils";
import { AGENTS } from "../../constants/agents.constants";

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
    const { message: changeDescription, selectedFiles, agent } = data;

    // Get open editors and merge their paths with selectedFiles
    const openEditors = vscode.window.tabGroups.all
      .flatMap((group) => group.tabs)
      .map((tab) =>
        tab.input instanceof vscode.TabInputText ||
        tab.input instanceof vscode.TabInputNotebook
          ? tab.input.uri?.fsPath || ""
          : ""
      );

    const updatedSelectedFiles = openEditors.reduce(
      (acc: string[], tabPath) => {
        const selectedAncestorPath = selectedFiles.find(
          (f) => tabPath.startsWith(f) && f !== tabPath
        );
        if (selectedAncestorPath) {
          return acc;
        } else {
          return [...acc, tabPath];
        }
      },
      selectedFiles
    );

    const response = await Services.getLlmService().sendPrompt(
      [
        ...(agent ? [{ user: "instructor", message: AGENTS[agent]?.systemInstructions }] : []),
        { user: "user", message: changeDescription },
      ],
      updatedSelectedFiles
    );

    serverIpc.sendToClient(ServerToClientChannel.SendMessage, {
      message: response,
    });
  });

  async function sendWorkspaceFiles() {
    const workspaceRoots =
      vscode.workspace.workspaceFolders?.map((folder) => folder.uri) || [];
    const files = await getFilesRespectingGitignore();
    const workspaceFileTree = createFileTree(workspaceRoots, files); // Update the stored file tree

    serverIpc.sendToClient(ServerToClientChannel.SendWorkspaceFiles, {
      files: workspaceFileTree,
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
