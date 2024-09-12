import * as vscode from "vscode";
import * as path from "path";
import ignore from "ignore";
import { FileNode } from "src/types/file-node";

interface GitignoreInfo {
  path: string;
  ig: ReturnType<typeof ignore>;
}

export function createFileTree(files: vscode.Uri[]): FileNode {
  const root: FileNode = { name: "root", children: [] };

  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    let currentNode = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      let child = currentNode.children?.find((c) => c.name === part);

      if (!child) {
        child = { name: part };
        if (i < parts.length - 1) {
          child.children = [];
        }
        currentNode.children = currentNode.children || [];
        currentNode.children.push(child);
      }

      currentNode = child;
    }
  }

  return root;
}

export async function getFilesRespectingGitignore(): Promise<vscode.Uri[]> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return [];
  }

  const gitignores = await findGitignores(workspaceFolder.uri);
  const allFiles = await vscode.workspace.findFiles("**/*");

  return allFiles.filter((file) => !isIgnored(file.fsPath, gitignores));
}

async function findGitignores(
  workspaceUri: vscode.Uri
): Promise<GitignoreInfo[]> {
  const gitignoreFiles = await vscode.workspace.findFiles("**/.gitignore");
  const gitignores: GitignoreInfo[] = [];

  for (const gitignoreUri of gitignoreFiles) {
    const content = await vscode.workspace.fs.readFile(gitignoreUri);
    gitignores.push({
      path: path.dirname(gitignoreUri.fsPath),
      ig: ignore().add(content.toString()),
    });
  }

  return gitignores;
}

function isIgnored(filePath: string, gitignores: GitignoreInfo[]): boolean {
  for (const { path: gitignorePath, ig } of gitignores) {
    if (filePath.startsWith(gitignorePath)) {
      const relativePath = path.relative(gitignorePath, filePath);
      if (ig.ignores(relativePath)) {
        return true;
      }
    }
  }
  return false;
}

// Example usage in a VS Code extension command
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.filterGitignoreFiles",
    async () => {
      const files = await getFilesRespectingGitignore();
      const fileTree = createFileTree(files);
      vscode.window.showInformationMessage(
        `Found ${files.length} files not ignored by .gitignore`
      );
      console.log(JSON.stringify(fileTree, null, 2)); // Log the tree structure
    }
  );

  context.subscriptions.push(disposable);
}
