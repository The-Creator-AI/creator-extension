import { ServerPostMessageManager } from "../../../ipc/server-ipc";
import { mergeOpenEditorsWithSelectedFiles } from "./mergeOpenEditorsWithSelectedFiles";
import { Services } from "../../../services/services";
import { ServerToClientChannel } from "../../../ipc/channels.enum";

/**
 * Handles the `SendMessage` message from the client, which initiates a conversation with the LLM.
 *
 * @param data An object containing the chat history and selected files.
 */
export async function handleSendMessage(
    serverIpc: ServerPostMessageManager,
    data: {
  chatHistory: any[];
  selectedFiles: string[];
}) {
  const { chatHistory, selectedFiles } = data;

  const updatedSelectedFiles = mergeOpenEditorsWithSelectedFiles(selectedFiles);

  const response = await Services.getLlmService().sendPrompt(
    chatHistory,
    updatedSelectedFiles
  );

  serverIpc.sendToClient(ServerToClientChannel.SendMessage, {
    message: response,
  });
}
