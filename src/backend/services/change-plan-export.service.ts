import { Injectable } from 'injection-js';
import * as vscode from 'vscode';
import { getChangePlanViewState } from '@/views/change-plan-view/store/change-plan-view.store';
import { ChangePlan } from '@/views/change-plan-view/store/change-plan-view.state-type';

@Injectable()
export class ChangePlanExportService {
  async exportAllChangePlans(): Promise<void> {
    const changePlans = getChangePlanViewState('changePlans');
    const jsonString = JSON.stringify(changePlans, null, 2);

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