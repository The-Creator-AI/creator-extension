import * as vscode from "vscode";
import { ServerPostMessageManager } from "../../ipc/server-ipc";
import {
  ClientToServerChannel,
  ServerToClientChannel,
} from "../../ipc/channels.enum";
import { createFileTree, getFilesRespectingGitignore } from "../../backend/services/workspace-files.utils";

// Function to handle messages for the graph view
export function handleGraphViewMessages(
  serverIpc: ServerPostMessageManager
) {
  serverIpc.onClientMessage(
    ClientToServerChannel.RequestWorkspaceFiles,
    async (data) => {
      const workspaceRoots =
        vscode.workspace.workspaceFolders?.map((folder) => folder.uri) || [];
      const files = await getFilesRespectingGitignore();
      const fileTree = createFileTree(workspaceRoots, files, true);

      // Send the files back to the client
      serverIpc.sendToClient(ServerToClientChannel.SendWorkspaceFiles, {
        files: fileTree,
      });
    }
  );
}
