import * as vscode from 'vscode';
import { StorageKeysEnum } from '../types/storage-keys.enum';
import { getContext } from '../../extension';

export class PersistentStoreRepository {
  private readonly workspaceState: vscode.Memento;

  constructor() {
    this.workspaceState = getContext().workspaceState;
  }

  public getChangePlanViewState<T>(): T | undefined {
    const data = this.workspaceState.get<T>(StorageKeysEnum.ChangePlanViewState);
    return data;
  }

  public setChangePlanViewState(data: unknown): void {
    this.workspaceState.update(StorageKeysEnum.ChangePlanViewState, data);
  }
}