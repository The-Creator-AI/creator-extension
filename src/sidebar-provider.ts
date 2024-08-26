import * as vscode from 'vscode';
import { Services } from './services';
import { ChatRepository } from './repositories/chat.respository';
import { ServerPostMessageManager } from './ipc/server-ipc';
import { ClientToServerChannel, ServerToClientChannel } from './ipc/channels.enum';

export class SidebarProvider implements vscode.WebviewViewProvider {

    public static readonly chatViewType = 'creatorChat';
    public static readonly fileExplorerViewType = 'fileExplorer'; // New view type

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

        // Conditional rendering based on view type
        switch (webviewView.viewType) {
            case SidebarProvider.chatViewType:
                webviewView.webview.html = this._getHtmlForWebview(webviewView.webview, SidebarProvider.chatViewType);
                break;
            case SidebarProvider.fileExplorerViewType:
                webviewView.webview.html = this._getHtmlForWebview(webviewView.webview, SidebarProvider.fileExplorerViewType);
                break;
            default:
                webviewView.webview.html = 'Unknown view type';
        }

        const serverIpc = ServerPostMessageManager.getInstance(
            webviewView.webview.onDidReceiveMessage,
            (data: any) => webviewView.webview.postMessage(data)
        );

        // Handle messages for the chat view
        if (webviewView.viewType === SidebarProvider.chatViewType) {
            serverIpc?.onClientMessage(ClientToServerChannel.SendMessage, async (data) => {
                console.log({ dataOnServerSide: data });
                const userMessage = data.message;

                // Fetch Chat History from Repository
                let existingChat = await ChatRepository.getActiveChat();
                await ChatRepository.addMessageToChat(existingChat.id, { user: 'user', message: userMessage });
                existingChat = await ChatRepository.getActiveChat();

                const response = await Services.getLlmService().sendPrompt(existingChat.messages);

                serverIpc.sendToClient(ServerToClientChannel.SendMessage, { message: response });

                await ChatRepository.addMessageToChat(existingChat.id, { user: 'AI', message: response });
            });
            serverIpc?.onClientMessage(ClientToServerChannel.RequestChatHistory, async (data) => {
                console.log({ dataOnServerSide: data });
                const chatId = data.chatId;
                const chat = await ChatRepository.getChatById(chatId);
                if (!chat) {
                    return;
                }
                serverIpc.sendToClient(ServerToClientChannel.SendChatHistory, { chatId: chat.id, messages: chat.messages });
            });
        }

        // Handle messages for the file explorer view
        if (webviewView.viewType === SidebarProvider.fileExplorerViewType) {
            // Add logic to handle messages for the file explorer view here
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview, viewType: string) {
        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'sidebar.js'));

        // Use a nonce to only allow a specific script to be run.
        const nonce = getNonce();

        // Generate HTML based on the view type
        switch (viewType) {
            case SidebarProvider.chatViewType:
                return `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body>
                    <div id="root"></div>
                    <script nonce="${nonce}" src="${scriptUri}"></script>
                </body>
                </html>`;
            case SidebarProvider.fileExplorerViewType:
                return `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body>
                    <h1>File Explorer</h1>
                    <div id="file-explorer-root"></div>
                    <script nonce="${nonce}" src="${scriptUri}"></script>
                </body>
                </html>`;
            default:
                return 'Unknown view type';
        }
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
