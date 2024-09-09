import * as vscode from "vscode";
import { registerViews } from "./views/register-views";
import { registerCommands } from "./commands/register-commands";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "creator-extension" is now active!'
  );

  registerCommands(context);
  registerViews(context);
}

export function deactivate() {}
