import { ClientToServerChannel, ServerToClientChannel } from "./channels.enum";

export type ChannelBody<T extends ClientToServerChannel | ServerToClientChannel> =
    T extends ClientToServerChannel.SendMessage ? { message: string } :
    T extends ClientToServerChannel.RequestData ? { requestId: string, dataKey: string } :
    T extends ServerToClientChannel.SendMessage ? { message: string } :
    T extends ServerToClientChannel.DataResponse ? { requestId: string, data: any } :
    never; 