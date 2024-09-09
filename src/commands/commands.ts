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
  // Add more commands as needed
];
