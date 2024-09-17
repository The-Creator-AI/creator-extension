import { remoteSetChangePlanViewState } from "@/views/change-plan-view/utils/remoteSetChangePlanViewState";
import { ChatRepository } from "../backend/repositories/chat.respository";
import { Services } from "../backend/services/services";
import * as vscode from "vscode";
import { serverIPCs } from "@/views/register-views";
import {VIEW_TYPES} from '@/views/view-types';

// Define an array of commands with their corresponding callback functions
export const commands = [
  {
    commandId: "the-creator-ai.helloWorld",
    callback: () => {
      console.log("Hello World from the-creator-ai!");
      vscode.window.showInformationMessage(
        "Hello World from the-creator-ai!"
      );
    },
  },
  {
    commandId: "the-creator-ai.clearChatHistory",
    callback: async () => {
      // Implement the logic to clear the chat history
      const activeChat = await ChatRepository.getActiveChat();
      if (activeChat) {
        activeChat.messages = []; // Clear the messages array
        await ChatRepository.updateChat(activeChat);

        // Refresh the chat view
        // You might need to access the webviewView instance and call webviewView.webview.postMessage
        // to trigger an update in the chat view's content
        // (This would typically be done in the chat-view.ts file where you have access to the webviewView)
      }
    },
  },
  {
    commandId: "the-creator-ai.resetClearChangePlanViewState",
    callback: async () => {
      const persistentStoreRepository = Services.getPersistentStoreRepository();
      await persistentStoreRepository.clearChangePlanViewState();
    },
  },
  {
    commandId: "the-creator-ai.chooseChangePlan",
    callback: async () => {
      const persistentStoreRepository = Services.getPersistentStoreRepository();
      const store = persistentStoreRepository.getChangePlanViewState();
      const changePlans = store?.changePlans || [];
  
      // Sort change plans by last updated date (descending)
      changePlans.sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);
  
      // Show quick pick with plan titles
      const selectedPlanTitle = await vscode.window.showQuickPick(changePlans.map(plan => {
        return {
          label: plan.planTitle,
          description: new Date(plan.lastUpdatedAt).toLocaleString()
        };
      }));
  
      if (selectedPlanTitle) {
        // Update state with selected plan
        const selectedPlan = changePlans.find(plan => plan.planTitle === selectedPlanTitle.label);
        if (selectedPlan) {
          const serverIpc = serverIPCs[VIEW_TYPES.SIDEBAR.CHANGE_PLAN];
          remoteSetChangePlanViewState(serverIpc, "changeDescription", selectedPlan.planDescription);
          remoteSetChangePlanViewState(serverIpc, "llmResponse", selectedPlan.llmResponse);
          remoteSetChangePlanViewState(serverIpc, "selectedFiles", selectedPlan.selectedFiles);
          remoteSetChangePlanViewState(serverIpc, "chatHistory", selectedPlan.chatHistory);
        }
      }
    }
  },
  {
    commandId: "the-creator-ai.newPlan",
    callback: async () => {
      const serverIpc = serverIPCs[VIEW_TYPES.SIDEBAR.CHANGE_PLAN];
      remoteSetChangePlanViewState(serverIpc, "changeDescription", "");
      remoteSetChangePlanViewState(serverIpc, "llmResponse", "");
      remoteSetChangePlanViewState(serverIpc, "chatHistory", []);
      remoteSetChangePlanViewState(serverIpc, "isLoading", false);
    },
  },
  {
    commandId: "the-creator-ai.openGraphView",
    callback: async () => {
      // This callback will be executed when the command is invoked
      console.log('Opening Graph View...');
      // Add logic here to open your Graph View
    },
  },
];