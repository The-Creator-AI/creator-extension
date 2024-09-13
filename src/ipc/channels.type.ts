import { FileNode } from "src/types/file-node";
import { ClientToServerChannel, ServerToClientChannel } from "./channels.enum";

export type ChannelBody<
  T extends ClientToServerChannel | ServerToClientChannel
> = T extends ClientToServerChannel.SendMessage
  ? { message: string; selectedFiles?: string[] }
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
  : T extends ClientToServerChannel.RequestWorkspaceFiles // Add new channel request type
  ? {
      // You can add options for filtering here if needed
      // e.g., fileTypes: string[];
    }
  : T extends ServerToClientChannel.SendWorkspaceFiles // Add new channel response type
  ? {
      files: FileNode[];
    }
  : T extends ServerToClientChannel.SendSelectedFiles // Add new channel response type for selected files
  ? {
      selectedFiles: string[]; 
    }
  : never;
