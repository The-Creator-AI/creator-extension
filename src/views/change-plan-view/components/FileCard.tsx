import { useStore } from '@/store/useStore';
import { changePlanViewStoreStateSubject } from '@/views/change-plan-view/store/change-plan-view.store';
import * as React from "react";
import { MdDescription, MdFileDownload } from 'react-icons/md';
import { ClientToServerChannel } from '../../../ipc/channels.enum';
import { ClientPostMessageManager } from '../../../ipc/client-ipc';
import { getChangePlanViewState } from '../store/change-plan-view.store';
import { setChangePlanViewState } from '@/views/change-plan-view/store/change-plan-view.logic';
import { ServerToClientChannel } from '@/ipc/channels.enum';

interface FileCardProps {
    fileName: string;
    operation: string;
    recommendations: string[];
    filePath: string;
}

const FileCard: React.FC<FileCardProps> = ({ fileName, operation, recommendations, filePath }) => {
    const { fileChunkMap } = useStore(changePlanViewStoreStateSubject);
    const clientIpc = ClientPostMessageManager.getInstance();
    const chatHistory = getChangePlanViewState('chatHistory');
    const selectedFiles = getChangePlanViewState('selectedFiles');
    const isLoading = fileChunkMap[filePath]?.isLoading;
    const fileContent = fileChunkMap[filePath]?.fileContent;

    React.useEffect(() => {
        clientIpc.onServerMessage(ServerToClientChannel.StreamFileCode, (data) => {
            const { filePath, chunk } = data;
            const fileChunkMap = getChangePlanViewState('fileChunkMap');
            const localFilePath = Object.keys(fileChunkMap).find((key) => key.includes(filePath) || filePath.includes(key));
            const updatedFileChunkMap = {
                ...fileChunkMap,
                [localFilePath]: {
                    ...fileChunkMap[localFilePath],
                    fileContent: (fileChunkMap[localFilePath]?.fileContent || '') + chunk
                }
            };
            setChangePlanViewState('fileChunkMap')(updatedFileChunkMap);
        });

        clientIpc.onServerMessage(ServerToClientChannel.SendFileCode, (data) => {
            console.log({ data });
            const { filePath } = data;
            const fileChunkMap = getChangePlanViewState('fileChunkMap');
            const localFilePath = Object.keys(fileChunkMap).find((key) => key.includes(filePath) || filePath.includes(key));
            const updatedFileChunkMap = {
                ...fileChunkMap,
                [localFilePath]: {
                    ...fileChunkMap[localFilePath],
                    isLoading: false
                }
            };
            setChangePlanViewState('fileChunkMap')(updatedFileChunkMap);
        });
    }, []);

    const handleRequestOpenFile = (filePath: string) => {
        clientIpc.sendToServer(ClientToServerChannel.RequestOpenFile, {
            filePath
        });
    };

    const handleRequestFileCode = (filePath: string) => {
        const fileChunkMap = getChangePlanViewState('fileChunkMap');
        const updatedFileChunkMap = {
            ...fileChunkMap,
            [filePath]: {
                isLoading: true,
                fileContent: ''
            }
        };
        setChangePlanViewState('fileChunkMap')(updatedFileChunkMap);
        clientIpc.sendToServer(ClientToServerChannel.RequestStreamFileCode, {
            filePath,
            chatHistory,
            selectedFiles,
        });
    };

    return (
        <div className="file-card bg-sidebar-bg border border-gray-300 rounded p-4 shadow-md mr-4" style={{ minWidth: '300px' }}>
            <div className="flex items-center mb-2">
                <MdDescription
                    size={18}
                    className={`mr-2 cursor-pointer ${isLoading ? 'text-gray-400' : 'hover:text-blue-500'} `}
                />
                <h4 className="text-lg font-medium text-editor-fg" onClick={() => handleRequestOpenFile(filePath)}>{fileName}</h4>
                {!isLoading ? <MdFileDownload
                    size={18}
                    className={`ml-2 cursor-pointer text-blue-500`}
                    onClick={() => handleRequestFileCode(filePath)}
                /> : null}
                {isLoading && (
                    <span className="loader mr-2">
                        <div className="spinner w-4 h-4 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin ml-2"></div>
                    </span>
                )}
                {isLoading && fileContent?.length ? (
                    <span className="text-xs text-gray-500 whitespace-nowrap">({fileContent?.length} ++)</span>
                ) : null}
            </div>
            <p className="text-gray-700 mb-3">{operation}</p>
            <ul className="list-disc list-inside">
                {recommendations.map((recommendation, index) => (
                    <li key={index} className="text-gray-500">{recommendation}</li>
                ))}
            </ul>
        </div>
    );
};

export default FileCard;