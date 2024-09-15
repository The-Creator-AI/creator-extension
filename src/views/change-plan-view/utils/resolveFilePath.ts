import * as vscode from "vscode";
import * as fs from "fs";

/**
 * Resolves a file path, handling both absolute and relative paths.
 *
 * @param filePath The file path to resolve.
 * @returns The absolute file path, or null if the file cannot be resolved.
 */
export async function resolveFilePath(filePath: string): Promise<string | null> {
  const files = await vscode.workspace.findFiles(`**/${filePath}`, null, 10);

  if (files.length === 1) {
    return files[0].fsPath;
  } else if (files.length > 1) {
    const selectedFile = await vscode.window.showQuickPick(
      files.map((file) => file.fsPath),
      {
        placeHolder: "Multiple files found. Please select the correct one.",
      }
    );
    return selectedFile || null;
  } else {
    const pathParts = filePath.split("/");
    if (pathParts.length > 1) {
      // Drop the first part of the path and try again
      const remainingPath = pathParts.slice(1).join("/");
      return resolveFilePath(remainingPath);
    } else {
      // vscode.window.showErrorMessage(
      //   "Could not find the file. Please provide a valid file path.",
      //   filePath
      // );
      // ask the user to choose the location where to create the file
      const workspacePath = vscode.workspace.workspaceFolders![0].uri.fsPath;
      const newFilePath = await vscode.window.showInputBox({
        prompt: "The file is not found. Please confirm the file path to create an empty file.",
        value: filePath,
      });
      if (newFilePath) {
        fs.writeFileSync(`${workspacePath}/${newFilePath}`, "");
        return `${workspacePath}/${newFilePath}`;
      }
      return null;
    }
  }
}