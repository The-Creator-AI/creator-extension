// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "creator-extension" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('creator-extension.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
    console.log('Hello World from creator-extension!');
		vscode.window.showInformationMessage('Hello World from creator-extension!');
	});

	context.subscriptions.push(disposable);

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
	  console.log({ pathToHtml });
	  console.log(panel.webview.html);

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

// This method is called when your extension is deactivated
export function deactivate() {}
