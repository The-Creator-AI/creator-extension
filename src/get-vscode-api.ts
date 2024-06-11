import { WebviewApi } from "./vscode-webview";

let vscode: WebviewApi<unknown> | null = null;

const getVscode = () => {
    if (!vscode) {
        vscode = acquireVsCodeApi();
    }
    return vscode;
};

export default getVscode;