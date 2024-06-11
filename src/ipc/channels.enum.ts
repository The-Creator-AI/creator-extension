export enum ClientToServerChannel {
    SendMessage = 'clientToServer.sendMessage',
    RequestChatHistory = 'clientToServer.requestChatHistory',
}

export enum ServerToClientChannel {
    SendMessage = 'serverToClient.sendMessage',
    SendChatHistory = 'serverToClient.sendChatHistory',
}
