import * as vscode from "vscode";
import * as fs from "fs";
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
    const { chatHistory, selectedFiles } = data;

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
      chatHistory,
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

  serverIpc.onClientMessage(
    ClientToServerChannel.RequestFileCode,
    async (data) => {
      const { filePath, chatHistory } = data;

      // 1. Fetch the file code using VS Code API
      const fileUri = vscode.Uri.file(filePath);
      const fileContent = await vscode.workspace.fs.readFile(fileUri);
      const fileContentString = new TextDecoder().decode(fileContent);

      // 2. Append the chat history and a request for code updates to the final message
      const finalMessage = `
      Here's the code for the file: ${filePath}

      \`\`\`
      ${fileContentString}
      \`\`\`

      Please suggest any necessary updates or modifications to the code based on the plan above and previous conversation:
      `;

      // 3. Send the combined message to the LLM
      const response = await Services.getLlmService().sendPrompt([
        ...chatHistory,
        { user: "instructor", message: AGENTS.Developer.systemInstructions },
        { user: "user", message: finalMessage },
      ]);

      // 4. Write the updated content back to the file using VS Code API
      const encoder = new TextEncoder();
      await vscode.workspace.fs.writeFile(fileUri, encoder.encode(response));

      // 5. Open the file in VS Code
      const document = await vscode.workspace.openTextDocument(fileUri);
      await vscode.window.showTextDocument(document);

      // 6. Show git diff
      const gitExtension =
        vscode.extensions.getExtension("vscode.git")?.exports;
      if (gitExtension) {
        const git = gitExtension.getAPI(1);
        const repository = git.repositories[0];

        if (repository) {
          await repository.diffWith(filePath);
        }
      }

      // 7. Send the updated file content back to the change plan view
      serverIpc.sendToClient(ServerToClientChannel.SendFileCode, {
        filePath,
        fileContent: response,
      });
    }
  );

  // Clean up function to dispose of the file system watcher
  return () => {
    if (fileSystemWatcher) {
      fileSystemWatcher.dispose();
    }
  };
}
