export enum ClientToServerChannel {
  SendMessage = "clientToServer.sendMessage",
  RequestChatHistory = "clientToServer.requestChatHistory",
  RequestOpenEditors = "clientToServer.requestOpenEditors",
  SendSelectedEditor = "clientToServer.sendSelectedEditor",
  RequestWorkspaceFiles = "clientToServer.requestWorkspaceFiles",
  RequestFileCode = "clientToServer.requestFileCode", 
  RequestOpenFile = "clientToServer.requestOpenFile",
  SendStreamMessage = "clientToServer.sendStreamMessage" // Added channel for sending stream messages from client to server
}

export enum ServerToClientChannel {
  SendMessage = "serverToClient.sendMessage",
  SendChatHistory = "serverToClient.sendChatHistory",
  SendOpenEditors = "serverToClient.sendOpenEditors",
  SendWorkspaceFiles = "serverToClient.sendWorkspaceFiles",
  SendFileCode = "serverToClient.sendFileCode", 
  SendActiveTab = "clientToServer.sendActiveTab",
  StreamMessage = "serverToClient.streamMessage" // Added channel for sending stream messages from server to client
}