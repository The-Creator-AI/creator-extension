export enum ClientToServerChannel {
  SendMessage = "clientToServer.sendMessage",
  RequestChatHistory = "clientToServer.requestChatHistory",
  RequestOpenEditors = "clientToServer.requestOpenEditors",
  SendSelectedEditor = "clientToServer.sendSelectedEditor",
  RequestWorkspaceFiles = "clientToServer.requestWorkspaceFiles"
}

export enum ServerToClientChannel {
  SendMessage = "serverToClient.sendMessage",
  SendChatHistory = "serverToClient.sendChatHistory",
  SendOpenEditors = "serverToClient.sendOpenEditors",
  SendWorkspaceFiles = "serverToClient.sendWorkspaceFiles",
  SendSelectedFiles = "serverToClient.sendSelectedFiles",
}
