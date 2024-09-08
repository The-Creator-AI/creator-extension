// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { resolveWebviewView } from "./views/sidebar/sidebar-views";
import { VIEW_TYPES } from "./views/view-types";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "creator-extension" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "creator-extension.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      console.log("Hello World from creator-extension!");
      vscode.window.showInformationMessage(
        "Hello World from creator-extension!"
      );
    }
  );

  context.subscriptions.push(disposable);

  // Register webview view providers
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(VIEW_TYPES.SIDEBAR.CHAT, {
      resolveWebviewView: (webviewView, _, token) =>
        resolveWebviewView(webviewView, context, token, context.extensionUri),
    })
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      VIEW_TYPES.SIDEBAR.FILE_EXPLORER,
      {
        resolveWebviewView: (webviewView, _, token) =>
          resolveWebviewView(webviewView, context, token, context.extensionUri),
      }
    )
  );

  // Register Change Plan view provider
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(VIEW_TYPES.SIDEBAR.CHANGE_PLAN, {
      resolveWebviewView: (webviewView, _, token) =>
        resolveWebviewView(webviewView, context, token, context.extensionUri),
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
