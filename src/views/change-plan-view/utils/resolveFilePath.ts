import * as vscode from "vscode";
import * as fs from "fs";

/**
 * Resolves a file path, handling both absolute and relative paths.
 * 
 * @param filePath The file path to resolve.
 * @returns The absolute file path, or null if the file cannot be resolved.
 */
export async function resolveFilePath(filePath: string): Promise<string | null> {
  if (fs.existsSync(filePath)) {
    return filePath;
  }

  const files = await vscode.workspace.findFiles(
    `**/${filePath}`,
    null,
    10
  );

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
    vscode.window.showErrorMessage(
      "Could not find the file. Please provide a valid file path.",
      filePath
    );
    return null;
  }
}