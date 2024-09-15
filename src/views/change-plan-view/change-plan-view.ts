import * as vscode from "vscode";
import {
  ClientToServerChannel,
  ServerToClientChannel,
} from "../../ipc/channels.enum";
import { ServerPostMessageManager } from "../../ipc/server-ipc";
import { getViewHtml } from "../../utils/get-view-html";
import { handleFileCodeUpdate } from "./utils/handleFileCodeUpdate";
import { handleFileOpen } from "./utils/handleFileOpen";
import { handleSendMessage } from "./utils/handleSendMessage";
import { handleWorkspaceFilesRequest } from "./utils/handleWorkspaceFilesRequest";
import { handleActiveTabChange } from "./utils/handleActiveTabChange";
import { handleStreamMessage } from "./utils/handleStreamMessage";
import { Services } from "../../backend/services/services";
import { ChangePlanViewStore } from "./store/change-plan-view.state-type";

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

  serverIpc.onClientMessage(ClientToServerChannel.SendStreamMessage, (data) => {
    handleStreamMessage(serverIpc, data);
  });

  serverIpc.onClientMessage(
    ClientToServerChannel.RequestOpenFile,
    async (data) => {
      handleFileOpen(data);
    }
  );

  serverIpc.onClientMessage(ClientToServerChannel.PersistStore, (data) => {
    const { storeName, storeState } = data;
    if (storeName === "changePlanViewState") {
      Services.getPersistentStoreRepository().setChangePlanViewState(
        storeState
      );
    }
  });

  serverIpc.onClientMessage(ClientToServerChannel.FetchStore, (data) => {
    const { storeName } = data;
    if (storeName === "changePlanViewState") {
      const storeState =
        Services.getPersistentStoreRepository().getChangePlanViewState<ChangePlanViewStore>();
      console.log("storeState", storeState);
      for (const key in storeState) {
        serverIpc.sendToClient(ServerToClientChannel.SetChangePlanViewState, {
          keyPath: key as keyof ChangePlanViewStore,
          value: storeState[key],
        });
      }
    }
  });

  handleActiveTabChange(serverIpc);
}
