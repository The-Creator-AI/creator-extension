import getVscode from "../get-vscode-api";
import { ClientToServerChannel, ServerToClientChannel } from "./channels.enum";
import { ChannelBody } from "./channels.type";

// Client-side PostMessageManager
export class ClientPostMessageManager {
  // Client-to-Server communication
  send<T extends ClientToServerChannel>(channel: T, body: ChannelBody<T>): void {
    const message = { channel, body };
    getVscode().postMessage(message);
  }

  on<T extends ServerToClientChannel>(channel: T, callback: (body: ChannelBody<T>) => void): void {
    // this.onMessage([channel], callback);
    window.addEventListener('message', (event: MessageEvent) => {
      const data = event.data;
      console.log({ dataOnClientSide: data });
      if (channel === data.channel) {
        callback(data.body);
      }
    });
  }
}
