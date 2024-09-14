// /Users/pulkitsingh/dev/The Creator AI/creator-extension/src/ipc/channels.type.ts

import { FileNode } from "src/types/file-node";
import { ClientToServerChannel, ServerToClientChannel } from "./channels.enum";
import { ChatMessage } from "../repositories/chat.respository";

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
  : T extends ClientToServerChannel.RequestFileCode // Add new channel request type
  ? {
      filePath: string;
      chatHistory: ChatMessage[];
    }
  : T extends ServerToClientChannel.SendFileCode // Add new channel response type
  ? {
      filePath: string;
      fileContent: string;
    }
  : never;
