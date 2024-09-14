import { FileNode } from "../types/file-node";
import { ClientToServerChannel, ServerToClientChannel } from "./channels.enum";
import { ChatMessage } from "../backend/repositories/chat.respository";

export type ChannelBody<
  T extends ClientToServerChannel | ServerToClientChannel
> = T extends ClientToServerChannel.SendMessage
  ? { chatHistory: ChatMessage[]; selectedFiles: string[] }
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
  : T extends ClientToServerChannel.RequestWorkspaceFiles
  ? {
      // You can add options for filtering here if needed
      // e.g., fileTypes: string[];
    }
  : T extends ServerToClientChannel.SendWorkspaceFiles
  ? {
      files: FileNode[];
    }
  : T extends ClientToServerChannel.RequestOpenFile 
  ? {
      filePath: string;
    }
  : T extends ClientToServerChannel.RequestFileCode
  ? {
      filePath: string;
      chatHistory: ChatMessage[];
    }
  : T extends ServerToClientChannel.SendFileCode
  ? {
      filePath: string;
      fileContent: string;
    }
  : never;