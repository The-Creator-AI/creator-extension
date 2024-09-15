// /Users/pulkitsingh/dev/The Creator AI/creator-extension/src/views/change-plan-view/components/json-renderer.tsx

import * as React from "react";
import TreeView from "../../../components/tree-view/TreeView";
import { MdDescription } from 'react-icons/md';
import { ClientPostMessageManager } from '../../../ipc/client-ipc';
import { ClientToServerChannel } from '../../../ipc/channels.enum';
import { getChangePlanViewState } from '../store/change-plan-view.store';

const JsonResponse: React.FC<{ jsonData: any }> = ({ jsonData }) => {
    if (!jsonData) {
        return null;
    }

    const clientIpc = ClientPostMessageManager.getInstance();
    const chatHistory = getChangePlanViewState('chatHistory');
    const activeTab = getChangePlanViewState('activeTab');

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
        clientIpc.sendToServer(ClientToServerChannel.RequestFileCode, {
            filePath,
            chatHistory
        });
    };

    return (
        <div className="json-container p-4">
            <h3 className="text-xl font-bold mb-2">{jsonData.title}</h3>
            <p className="text-gray-700 mb-4">{jsonData.description}</p>

            {/* Render code plan using TreeView */}
            <TreeView
                data={transformCodePlanForTreeView(jsonData.code_plan)}
                renderNodeContent={(node) => {
                    const isActive = node.filePath && activeTab && (node.filePath.includes(activeTab) || activeTab?.includes(node.filePath));
                    return <div className={`${node.children ? 'font-medium' : 'font-normal'} p-2 hover:color-primary flex items-center`} >
                        {node.filePath && <MdDescription
                            size={18}
                            className="mr-2 cursor-pointer hover:text-blue-500"
                            onClick={() => handleRequestFileCode(node.filePath)}
                        />}
                        {node.value ? <span className="ml-2 font-normal">
                            {renderDot()}
                            {node.value}
                        </span>
                            : <span onClick={() => handleRequestOpenFile(node.filePath)}
                                className={`${isActive ? 'text-blue-600' : ''}`}> {node.name}</span>}
                    </div>;
                }}
            />
        </div>
    );
};

export default JsonResponse;