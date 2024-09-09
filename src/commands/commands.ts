import { ChatRepository } from "../repositories/chat.respository";
import * as vscode from "vscode";

// Define an array of commands with their corresponding callback functions
export const commands = [
  {
    commandId: "creator-extension.helloWorld",
    callback: () => {
      console.log("Hello World from creator-extension!");
      vscode.window.showInformationMessage(
        "Hello World from creator-extension!"
      );
    },
  },
  {
    commandId: "creator-extension.clearChatHistory",
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
  // Add more commands as needed
];
