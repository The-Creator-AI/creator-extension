import { AGENTS } from "@/constants/agents.constants";
import { ClientToServerChannel } from "@/ipc/channels.enum";
import { setChangePlanViewState as setState } from "@/views/change-plan-view/store/change-plan-view.logic";
import { getChangePlanViewState } from "@/views/change-plan-view/store/change-plan-view.store";
import { getSelectedFiles } from "@/views/change-plan-view/logic/getSelectedFiles";
import { ClientPostMessageManager } from "@/ipc/client-ipc";
import { FileNode } from "@/types/file-node";

export const handleSubmitPlanRequest = (
  clientIpc: ClientPostMessageManager,
  files: FileNode[]
) => {
  setState("isLoading")(true);
  const llmResponse = getChangePlanViewState("llmResponse");
  const changeDescription = getChangePlanViewState("changeDescription");

  const selectedFiles = getSelectedFiles(files);
  const newChatHistory = [
    ...(getChangePlanViewState("chatHistory").length < 1 || !llmResponse
      ? [
          {
            user: "instructor",
            message: AGENTS["Code Plan"]?.systemInstructions,
          },
        ]
      : [
          ...getChangePlanViewState("chatHistory"), // Use chatHistory from store
          {
            user: "instructor",
            message: AGENTS["Code Plan Update"]?.systemInstructions,
          },
        ]),
    { user: "user", message: changeDescription },
  ];
  setState("chatHistory")(newChatHistory); // Update chatHistory in the store

  clientIpc.sendToServer(ClientToServerChannel.SendStreamMessage, {
    chatHistory: newChatHistory,
    selectedFiles,
  });
};
