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
import { ChatMessage } from "@/backend/repositories/chat.respository";
import { parseJsonResponse } from "@/utils/parse-json";
import * as vscode from "vscode";
import { gitCommit } from "./utils/gitCommit";

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
        Services.getPersistentStoreRepository().getChangePlanViewState();
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

  // Handle request for commit message suggestions
  serverIpc.onClientMessage(
    ClientToServerChannel.RequestCommitMessageSuggestions,
    async ({ chatHistory }) => {
      // Add a user message at the end of the chat history prompting for commit message suggestions in JSON format.
      const userMessage: ChatMessage = {
        user: "user",
        message:
          "Please provide commit message suggestions in JSON format. Here's an example of the expected JSON structure:" +
          JSON.stringify({
            suggestions: ["Add feature X", "Fix bug Y", "Update dependency Z"],
          }),
      };

      // Send a message to the LLM service with the updated chat history.
      const llmResponse = await Services.getLlmService().sendPrompt([
        ...chatHistory.filter(
          (message) => message.user === "bot" || message.user === "user"
        ),
        userMessage,
      ]);

      // Parse the LLM response using parseJsonResponse from parse-json.
      const parsedResponse = parseJsonResponse(llmResponse.response);

      // Extract commit message suggestions from the parsed JSON.
      const suggestions = parsedResponse.suggestions;

      // Send the suggestions to the client.
      serverIpc.sendToClient(
        ServerToClientChannel.SendCommitMessageSuggestions,
        { suggestions }
      );
    }
  );

  // Handle commit action with the selected message
  serverIpc.onClientMessage(
    ClientToServerChannel.CommitStagedChanges,
    async (message) => {
      console.log("Committing staged changes with message:", message.message);
      try {
        // Use the publicly available VS Code command to commit the staged changes with the provided message
        gitCommit(message.message);
      } catch (error) {
        // Handle any errors during the commit process
        console.error("Error committing changes:", error);
      }
    }
  );
}
