import { Injectable } from 'injection-js';
import * as vscode from 'vscode';
import { Services } from './services';

@Injectable()
export class ChangePlanExportService {
  async exportAllChangePlans(): Promise<void> {
    const persistentStoreRepository = Services.getPersistentStoreRepository();
    const store = persistentStoreRepository.getChangePlanViewState();
    const changePlans = store?.changePlans || [];

    const jsonString = JSON.stringify(changePlans, null, 2);
    Services.getLoggerService().log(jsonString);

    const options: vscode.SaveDialogOptions = {
      defaultUri: vscode.Uri.file(`all_change_plans.json`),
      filters: {
        'JSON': ['json']
      }
    };

    const fileUri = await vscode.window.showSaveDialog(options);

    if (fileUri) {
      try {
        await vscode.workspace.fs.writeFile(fileUri, Buffer.from(jsonString, 'utf-8'));
        vscode.window.showInformationMessage(`All change plans exported successfully.`);
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to export change plans: ${error}`);
      }
    }
  }
}