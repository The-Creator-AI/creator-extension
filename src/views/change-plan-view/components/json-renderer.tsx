// /Users/pulkitsingh/dev/The Creator AI/creator-extension/src/views/change-plan-view/components/json-renderer.tsx

import * as React from "react";
import TreeView from "../../../components/tree-view/TreeView";
import { MdDescription } from 'react-icons/md';
import { ClientPostMessageManager } from '../../../ipc/client-ipc';
import { ClientToServerChannel, ServerToClientChannel } from '../../../ipc/channels.enum';
import { getChangePlanViewState } from '../store/change-plan-view.store';
import { useState } from 'react';
import {useStore} from '@/store/useStore';
import {changePlanViewStoreStateSubject} from '@/views/change-plan-view/store/change-plan-view.store';
import { setChangePlanViewState } from "../store/change-plan-view.logic";

const JsonResponse: React.FC<{ jsonData: any }> = ({ jsonData }) => {
    if (!jsonData) {
        return null;
    }
    const {
        fileChunkMap
      } = useStore(changePlanViewStoreStateSubject);

    const clientIpc = ClientPostMessageManager.getInstance();
    const chatHistory = getChangePlanViewState('chatHistory');
    const activeTab = getChangePlanViewState('activeTab');
    const selectedFiles = getChangePlanViewState('selectedFiles');

    const transformRecommendationsForTreeView = (recommendations: any[]): any[] => {
        return recommendations.map((recommendation, index) => {
            if (Array.isArray(recommendation)) {
                return {
                    name: `Recommendation ${index + 1}`,
                    children: recommendation.map((alt, altIndex) => ({
                        name: `Alternative ${altIndex + 1}`,
                        value: alt // Assuming alternatives are strings for now
                    }))
                };
            } else {
                return {
                    name: `Recommendation ${index + 1}`,
                    value: recommendation // Assuming single recommendations are strings
                };
            }
        });
    };

    const transformCodePlanForTreeView = (codePlan: any[]): any[] => {
        return codePlan.map((item) => {
            if (item.command) {
                return {
                    name: item.command,
                    value: item.description
                };
            } else {
                return {
                    name: item.filename?.split('/').pop() || '',
                    isExpanded: true,
                    filePath: item.filename,
                    children: transformRecommendationsForTreeView(item.recommendations)
                };
            }
        });
    };

    const renderDot = () => {
        return (
            <span className="h-2 w-2 bg-gray-700 rounded-full inline-block ml-2 mr-2" />
        );
    };

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

    return (
        <div className="json-container p-4">
            <h3 className="text-xl font-bold mb-2">{jsonData.title}</h3>
            <p className="text-gray-700 mb-4">{jsonData.description}</p>

            {/* Render code plan using TreeView */}
            <TreeView
                data={transformCodePlanForTreeView(jsonData.code_plan)}
                renderNodeContent={(node) => {
                    const isActive = node.filePath && activeTab && (node.filePath.includes(activeTab) || activeTab?.includes(node.filePath));
                    const isLoading = fileChunkMap[node.filePath]?.isLoading;
                    const fileContent = fileChunkMap[node.filePath]?.fileContent; 
                    return <div className={`${node.children ? 'font-medium' : 'font-normal'} p-2 hover:color-primary flex items-center relative`} >
                        {node.filePath && <div className="flex items-center">
                            {/* Display spinner when loading */}
                            {isLoading && (
                                <span className="loader mr-2"> 
                                    <div className="spinner w-4 h-4 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                                </span>
                            )}
                            <MdDescription
                                size={18}
                                className={`mr-2 cursor-pointer ${isLoading ? 'text-gray-400' : 'hover:text-blue-500'} `}
                                // onClick={!isLoading ? () => handleRequestFileCode(node.filePath) : undefined}
                                onClick={() => handleRequestFileCode(node.filePath)}
                            />
                            <span onClick={() => handleRequestOpenFile(node.filePath)}
                                className={`${isActive ? 'text-blue-600' : ''}`}> {node.name}</span>
                            {/* Display character count when loading */}
                            {isLoading && fileContent?.length ? (
                                <span className="text-xs text-gray-500 ml-2">({fileContent?.length} ++)</span>
                            ) : null}
                        </div>}
                        {node.value ? <span className="ml-2 font-normal">
                            {renderDot()}
                            {JSON.stringify(node.value)}
                        </span>
                            : null} 
                    </div>;
                }}
            />
        </div>
    );
};

export default JsonResponse;