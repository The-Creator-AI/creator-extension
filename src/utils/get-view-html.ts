import * as vscode from "vscode";

export function getViewHtml({
  webview,
  nonce,
  scriptUri,
}: {
  webview: vscode.Webview;
  nonce: string;
  scriptUri: string;
}): string {
  return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body>
                <div id="change-plan-view-root"></div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
}