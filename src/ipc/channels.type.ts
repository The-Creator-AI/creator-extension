import { ClientToServerChannel, ServerToClientChannel } from "./channels.enum";

export type ChannelBody<
  T extends ClientToServerChannel | ServerToClientChannel
> = T extends ClientToServerChannel.SendMessage
  ? { message: string }
  : T extends ServerToClientChannel.SendMessage
  ? { message: string }
  : T extends ClientToServerChannel.RequestChatHistory
  ? {
      chatId?: string;
    }
  : T extends ServerToClientChannel.SendChatHistory
  ? {
      chatId: string;
      messages: {
        user: string;
        message: string;
      }[];
    }
  : T extends ClientToServerChannel.RequestOpenEditors
  ? {}
  : T extends ServerToClientChannel.SendOpenEditors
  ? {
      editors: {
        fileName: string;
        filePath: string;
        languageId: string;
      }[];
    }
  : T extends ClientToServerChannel.SendSelectedEditor
  ? {
      editor: {
        fileName: string;
        filePath: string;
        languageId: string;
      };
    }
  : never;
