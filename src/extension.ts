// extension.ts
import * as vscode from 'vscode';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('yourExtension.showSidebar', () => {
      const panel = vscode.window.createWebviewPanel(
        'yourSidebarView', 
        'My Sidebar', 
        vscode.ViewColumn.One, // Position of the sidebar
        {
          enableScripts: true, // Allow JavaScript execution 
          // ...other options
        }
      );

      // Get path to webview asset
      const pathToHtml = vscode.Uri.joinPath(context.extensionUri, 'src', 'sidebar.html');

      // Read and send HTML content
      panel.webview.html = fs.readFileSync(pathToHtml.fsPath, 'utf8'); // Load HTML from a file

      // Handle messages from the webview
      panel.webview.onDidReceiveMessage(
        message => {
          switch (message.command) {
            case 'alert':
              vscode.window.showInformationMessage(message.text);
              return;
            // ...other message handlers
          }
        }
      );
    })
  );
}
