import {
  ClientToServerChannel,
  ServerToClientChannel,
} from "@/ipc/channels.enum";
import { ServerPostMessageManager } from "@/ipc/server-ipc";
import { handleFileCodeUpdate } from "@/views/change-plan-view/utils/handleFileCodeUpdate";
import { handleFileOpen } from "@/views/change-plan-view/utils/handleFileOpen";
import { handleSendMessage } from "@/views/change-plan-view/utils/handleSendMessage";
import { handleWorkspaceFilesRequest } from "@/views/change-plan-view/utils/handleWorkspaceFilesRequest";
import { handleActiveTabChange } from "@/views/change-plan-view/utils/handleActiveTabChange";
import { handleStreamMessage } from "@/views/change-plan-view/utils/handleStreamMessage";
import { Services } from "@/backend/services/services";
import { ChangePlanViewStore } from "@/views/change-plan-view/store/change-plan-view.state-type";

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
