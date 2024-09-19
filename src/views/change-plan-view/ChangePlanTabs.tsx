import * as React from "react";
import FileTree from '@/components/file-tree/FileTree';
import { ChangePlanSteps, ChangePlanStepsConfig } from '@/views/change-plan-view/change-plan-view.types';
import ChangeInputStep from '@/views/change-plan-view/components/change-input-step';
import LlmResponseStep from '@/views/change-plan-view/components/llm-response-step';
import { setChangePlanViewState as setState } from '@/views/change-plan-view/store/change-plan-view.logic';
import { getChangePlanViewState } from '@/views/change-plan-view/store/change-plan-view.store';
import { handleSubmitPlanRequest } from '@/views/change-plan-view/logic/handleSubmitPlanRequest';
import { ClientPostMessageManager } from "@/ipc/client-ipc";
import { FileNode } from "@/types/file-node";
import { handleFileClick } from "./logic/handleFileClick";
import CommitStep from "./components/commit-step/CommitStep";
import ApiKeyManagement from './components/api-key-management/ApiKeyManagement'; // Import the new ApiKeyManagement component

export const getChangePlanTabs = (
    {
        files,
        recentFiles,
        activeFile,
        setRecentFiles,
        setActiveFile
    }: {
        files: FileNode[],
        recentFiles: string[],
        activeFile: string,
        setRecentFiles: React.Dispatch<React.SetStateAction<string[]>>,
        setActiveFile: React.Dispatch<React.SetStateAction<string>>
    }
): ChangePlanStepsConfig => {
    const clientIpc = ClientPostMessageManager.getInstance();
    const selectedFiles = getChangePlanViewState("selectedFiles");
    const llmResponse = getChangePlanViewState("llmResponse");

    return {
        [ChangePlanSteps.ApiKeyManagement]: { // Add the new API Keys tab
            indicatorText: "API Keys",
            renderStep: () => (
                <ApiKeyManagement /> // Render the ApiKeyManagement component
            )
        },
        [ChangePlanSteps.Context]: {
            indicatorText: "Context",
            renderStep: () => (
                <div className="p-4 overflow-y-auto overflow-x-hidden">
                    {/* Render FileTree for each root node */}
                    {files.map((rootNode, index) => (
                        <FileTree
                            key={index}
                            data={[rootNode]} // Wrap the root node in an array
                            onFileClick={(filePath) => handleFileClick({
                                clientIpc,
                                filePath,
                                setActiveFile,
                            })}
                            selectedFiles={selectedFiles}
                            recentFiles={recentFiles}
                            activeFile={activeFile}
                            updateSelectedFiles={(files) => setState("selectedFiles")(files)}
                            updateRecentFiles={setRecentFiles}
                        />
                    ))}
                    {!files.length && (
                        <div className="text-gray-500">Loading files...</div>
                    )}
                </div>
            ),
        },
        [ChangePlanSteps.Plan]: {
            indicatorText: "Plan",
            renderStep: () => (
                <>
                    <LlmResponseStep llmResponse={llmResponse} />
                    <ChangeInputStep
                        isUpdateRequest={!!(
                            getChangePlanViewState("chatHistory").length > 0 && llmResponse
                        )}
                        handleChange={setState("changeDescription")}
                        handleSubmit={() => handleSubmitPlanRequest(clientIpc, files)}
                    />
                </>
            ),
        },
        [ChangePlanSteps.Commit]: {
            indicatorText: "Commit",
            renderStep: () => (
                <CommitStep />
            )
        }
    };
};