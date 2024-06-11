import * as vscode from 'vscode';
import { Services } from './services';
import { ChatRepository } from './repositories/chat.respository';

export class SidebarProvider implements vscode.WebviewViewProvider {

    public static readonly viewType = 'creatorChat';

    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,

            localResourceRoots: [
                this._extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
              case 'fromClient':
                vscode.commands.executeCommand('creator-extension.fromClient', data.value);
                break;
              case 'sendMessage':
                // Call your AI API here and send the response back to the webview
                const userMessage = data.value;

                // Fetch Chat History from Repository
                let existingChat = await ChatRepository.getActiveChat();
                await ChatRepository.addMessageToChat(existingChat.id, { user: 'user', message: userMessage });
                existingChat = await ChatRepository.getActiveChat();

                const response = await Services.getLlmService().sendPrompt(existingChat.messages);

                this.postMessage({ type: 'receiveMessage', value: response });
                await ChatRepository.addMessageToChat(existingChat.id, { user: 'AI', message: response });
                break;
            }
          });
    }

    public postMessage(message: any) {
        if (this._view) {
            this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
            this._view.webview.postMessage(message);
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'sidebar.js'));

        // Use a nonce to only allow a specific script to be run.
        const nonce = getNonce();
        // const pathToHtml = vscode.Uri.joinPath(this._extensionUri, 'src', 'sidebar.html');
        // fs.readFileSync(pathToHtml.fsPath, 'utf8');

        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading styles from our extension directory,
					and only allow scripts that have a specific nonce.
					(See the 'webview-sample' extension sample for img-src content security policy examples)
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">
			</head>
			<body>
                <div id="root"></div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
