import { Injectable } from 'injection-js';
import * as vscode from 'vscode';
import { setChangePlanViewState } from '@/views/change-plan-view/store/change-plan-view.logic';
import { ChangePlan } from '@/views/change-plan-view/store/change-plan-view.state-type';
import { getChangePlanViewState } from '@/views/change-plan-view/store/change-plan-view.store';

@Injectable()
export class ChangePlanImportService {
  async importAllChangePlans(): Promise<void> {
    const options: vscode.OpenDialogOptions = {
      canSelectMany: false,
      openLabel: 'Import',
      filters: {
        'JSON': ['json']
      }
    };

    const fileUri = await vscode.window.showOpenDialog(options);

    if (fileUri && fileUri[0]) {
      try {
        const fileContent = await vscode.workspace.fs.readFile(fileUri[0]);
        const plansJson: ChangePlan[] = JSON.parse(Buffer.from(fileContent).toString('utf-8'));

        if (!Array.isArray(plansJson)) {
          vscode.window.showErrorMessage('Invalid change plans format. Expected an array of plans.');
          return;
        }

        const currentPlans = getChangePlanViewState('changePlans');
        const updatedPlans = [...currentPlans];

        for (const plan of plansJson) {
          if (!this.isValidChangePlan(plan)) {
            vscode.window.showWarningMessage(`Skipping invalid change plan: ${(plan as ChangePlan).planTitle}`);
            continue;
          }

          const existingPlanIndex = currentPlans.findIndex(
            p => p.planTitle === plan.planTitle && p.planDescription === plan.planDescription
          );

          if (existingPlanIndex !== -1) {
            // Update existing plan
            updatedPlans[existingPlanIndex] = plan;
          } else {
            // Add new plan
            updatedPlans.push(plan);
          }
        }

        setChangePlanViewState('changePlans')(updatedPlans);
        vscode.window.showInformationMessage(`Change plans imported successfully.`);
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to import change plans: ${error}`);
      }
    }
  }

  private isValidChangePlan(plan: any): plan is ChangePlan {
    return (
      typeof plan === 'object' &&
      plan !== null &&
      typeof plan.planTitle === 'string' &&
      typeof plan.planDescription === 'string' &&
      typeof plan.llmResponse === 'string' &&
      typeof plan.planJson === 'object' &&
      Array.isArray(plan.chatHistory) &&
      Array.isArray(plan.selectedFiles)
    );
  }
}