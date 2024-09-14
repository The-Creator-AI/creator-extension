export enum ClientToServerChannel {
  SendMessage = "clientToServer.sendMessage",
  RequestChatHistory = "clientToServer.requestChatHistory",
  RequestOpenEditors = "clientToServer.requestOpenEditors",
  SendSelectedEditor = "clientToServer.sendSelectedEditor",
  RequestWorkspaceFiles = "clientToServer.requestWorkspaceFiles",
  RequestFileCode = "clientToServer.requestFileCode", // Add new channel for requesting file code
}

export enum ServerToClientChannel {
  SendMessage = "serverToClient.sendMessage",
  SendChatHistory = "serverToClient.sendChatHistory",
  SendOpenEditors = "serverToClient.sendOpenEditors",
  SendWorkspaceFiles = "serverToClient.sendWorkspaceFiles",
  SendFileCode = "serverToClient.sendFileCode", // Add new channel for sending file code
}
