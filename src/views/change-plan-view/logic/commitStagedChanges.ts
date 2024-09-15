import { ClientToServerChannel } from "@/ipc/channels.enum";
import { ClientPostMessageManager } from "@/ipc/client-ipc";

export const commitStagedChanges = (message: string) => {
  const clientIpc = ClientPostMessageManager.getInstance();
  clientIpc.sendToServer(ClientToServerChannel.CommitStagedChanges, {
    message,
  });
};
