export enum ClientToServerChannel {
  SendMessage = "clientToServer.sendMessage",
  RequestChatHistory = "clientToServer.requestChatHistory",
  RequestOpenEditors = "clientToServer.requestOpenEditors",
  SendSelectedEditor = "clientToServer.sendSelectedEditor",
  RequestWorkspaceFiles = "clientToServer.requestWorkspaceFiles",
  RequestFileCode = "clientToServer.requestFileCode", 
  RequestOpenFile = "clientToServer.requestOpenFile"
}

export enum ServerToClientChannel {
  SendMessage = "serverToClient.sendMessage",
  SendChatHistory = "serverToClient.sendChatHistory",
  SendOpenEditors = "serverToClient.sendOpenEditors",
  SendWorkspaceFiles = "serverToClient.sendWorkspaceFiles",
  SendFileCode = "serverToClient.sendFileCode", 
  SendActiveTab = "clientToServer.sendActiveTab"
}