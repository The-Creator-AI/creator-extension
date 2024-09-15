export enum ClientToServerChannel {
  SendMessage = "clientToServer.sendMessage",
  RequestChatHistory = "clientToServer.requestChatHistory",
  RequestOpenEditors = "clientToServer.requestOpenEditors",
  SendSelectedEditor = "clientToServer.sendSelectedEditor",
  RequestWorkspaceFiles = "clientToServer.requestWorkspaceFiles",
  RequestFileCode = "clientToServer.requestFileCode", 
  RequestOpenFile = "clientToServer.requestOpenFile",
  SendStreamMessage = "clientToServer.sendStreamMessage",
  PersistStore = "clientToServer.persistStore", // Add channel for persisting store
  FetchStore = "clientToServer.fetchStore", // Add channel for fetching store
  RequestCommitMessageSuggestions = "clientToServer.requestCommitMessageSuggestions",
  CommitStagedChanges = "clientToServer.commitStagedChanges"
}

export enum ServerToClientChannel {
  SendMessage = "serverToClient.sendMessage",
  SendChatHistory = "serverToClient.sendChatHistory",
  SendOpenEditors = "serverToClient.sendOpenEditors",
  SendWorkspaceFiles = "serverToClient.sendWorkspaceFiles",
  SendFileCode = "serverToClient.sendFileCode",
  StreamMessage = "serverToClient.streamMessage",
  SetChangePlanViewState = "clientToServer.setChangePlanViewState",
  SendCommitMessageSuggestions = "serverToClient.sendCommitMessageSuggestions"
}