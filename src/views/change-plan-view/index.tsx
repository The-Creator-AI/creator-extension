// creator-extension/src/views/change-plan-view/index.tsx
import * as React from "react";
import { useState, useEffect } from "react";
import * as ReactDOM from "react-dom/client";
import { FaSpinner, FaUndo } from "react-icons/fa"; // Import spinner and reset icons
import {
  ClientToServerChannel,
  ServerToClientChannel,
} from "../../ipc/channels.enum";
import { ClientPostMessageManager } from "../../ipc/client-ipc";
import { useStore } from "../../store/useStore";
import {
  ChangePlanSteps,
  ChangePlanStepsConfig,
} from "./change-plan-view.types";
import ChangeInputStep from "./components/change-input-step";
import LlmResponseStep from "./components/llm-response-step";
import StepIndicators from "./components/step-indicators";
import "./index.scss";
import {
  resetChangePlanViewStore,
  setChangePlanViewState as setState,
} from "./store/change-plan-view.logic";
import {
  changePlanViewStoreStateSubject,
  getChangePlanViewState,
} from "./store/change-plan-view.store";
import { FileNode } from "../../types/file-node";
import FileTree from "../../components/file-tree/FileTree";
import { ChatMessage } from "../../backend/repositories/chat.respository";
import { AGENTS } from "../../constants/agents.constants";
import ErrorBoundary from "../../components/ErrorBoundary";

const App = () => {
  const {
    changeDescription,
    isLoading,
    llmResponse,
    currentStep,
    selectedFiles,
    activeTab,
  } = useStore(changePlanViewStoreStateSubject);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const [activeFile, setActiveFile] = useState<string>();

  const clientIpc = ClientPostMessageManager.getInstance();

  const changePlanStepsConfig: ChangePlanStepsConfig = {
    [ChangePlanSteps.Context]: {
      indicatorText: "Context",
      renderStep: () => (
        <div className="p-4 overflow-y-auto overflow-x-hidden">
          {/* Render FileTree for each root node */}
          {files.map((rootNode, index) => (
            <FileTree
              key={index}
              data={[rootNode]} // Wrap the root node in an array
              onFileClick={handleFileClick}
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
            changeDescription={changeDescription}
            isLoading={isLoading}
            handleChange={setState("changeDescription")}
            handleSubmit={handleSubmit}
          />
        </>
      ),
    },
  };

  useEffect(() => {
    clientIpc.onServerMessage(
      ServerToClientChannel.SendMessage,
      ({ message }) => {
        setState("isLoading")(false);
        setState("llmResponse")(message);
        setState("changeDescription")("");
        setState("currentStep")(ChangePlanSteps.Plan);
        setState("chatHistory")([
          ...getChangePlanViewState("chatHistory"),
          { user: "bot", message },
        ]);
      }
    );

    clientIpc.onServerMessage(
      ServerToClientChannel.StreamMessage,
      ({ chunk }) => {
        setState("llmResponse")(getChangePlanViewState('llmResponse') + chunk);
      }
    );

    // Request workspace files on component mount
    clientIpc.sendToServer(ClientToServerChannel.RequestWorkspaceFiles, {});

    // Listen for workspace files response
    clientIpc.onServerMessage(
      ServerToClientChannel.SendWorkspaceFiles,
      ({ files }) => {
        setFiles(files);
      }
    );

    // Listener for SendFileCode
    clientIpc.onServerMessage(
      ServerToClientChannel.SendFileCode,
      ({ fileContent, filePath }) => {
        if (filePath) {
          try {
            console.log(fileContent);
            console.log(`File ${filePath} updated successfully.`);
          } catch (err) {
            console.error(`Error updating file ${filePath}:`, err);
          }
        }
      }
    );

    // Listens for SendActiveTabChange
    clientIpc.onServerMessage(
      ServerToClientChannel.SendActiveTab,
      ({ filePath }) => {
        setState("activeTab")(filePath);
      }
    );
  }, []);

  const handleFileClick = (filePath: string) => {
    setActiveFile(filePath);

    // Send the selected editor path to the extension
    clientIpc.sendToServer(ClientToServerChannel.SendSelectedEditor, {
      editor: {
        fileName: filePath.split("/").pop() || "",
        filePath,
        languageId: "", // You might need to determine the languageId here
      },
    });
  };

  const getSelectedFiles = () => {
    // Create an array to store absolute paths of selected files
    const absoluteSelectedFiles: string[] = [];

    // Iterate through updatedSelectedFiles and find corresponding absolute paths in files
    selectedFiles.forEach((relativePath) => {
      let matchingNode: FileNode | undefined = undefined;
      files.find((node) => {
        // Iterate through files to find the matching absolute path
        function findMatchingNode(node: FileNode) {
          if (node.absolutePath && node.absolutePath.endsWith(relativePath)) {
            return node;
          }
          if (node.children) {
            for (const child of node.children) {
              const matchingNode = findMatchingNode(child);
              if (matchingNode) {
                return matchingNode;
              }
            }
          }
          return undefined;
        }
        matchingNode = findMatchingNode(node);
      });

      if (matchingNode) {
        absoluteSelectedFiles.push(matchingNode.absolutePath || "");
      }
    });
    return absoluteSelectedFiles;
  };

  const handleSubmit = () => {
    setState("isLoading")(true);

    const selectedFiles = getSelectedFiles();
    const newChatHistory = [
      ...(getChangePlanViewState("chatHistory").length < 1 || !llmResponse
        ? [{ user: "instructor", message: AGENTS["Code Plan"]?.systemInstructions }]
        : [
          ...getChangePlanViewState("chatHistory"), // Use chatHistory from store
          {
            user: "instructor",
            message: AGENTS["Code Plan Update"]?.systemInstructions,
          },
        ]),
      { user: "user", message: changeDescription },
    ];
    setState("chatHistory")(newChatHistory); // Update chatHistory in the store

    clientIpc.sendToServer(ClientToServerChannel.SendStreamMessage, {
      chatHistory: newChatHistory,
      selectedFiles,
    });
  };

  const handleStepClick = (step: ChangePlanSteps) => {
    setState("currentStep")(step);
  };

  const handleReset = () => {
    resetChangePlanViewStore(); // Call the reset function to reset the store
  };

  const renderLoader = () => (
    <div
      className="loader flex justify-center items-center h-[100px]"
      data-testid="loader"
    >
      <FaSpinner className="spinner text-2xl animate-spin" />
    </div>
  );

  return (
    <div className="h-full fixed inset-0 flex flex-col justify-between">
      <div className="flex justify-end p-2">
        {/* Reset Icon */}
        <FaUndo
          className="text-gray-500 hover:text-blue-500 cursor-pointer"
          onClick={handleReset}
          data-testid="reset-icon"
        />
      </div>
      <StepIndicators
        changePlanStepsConfig={changePlanStepsConfig}
        currentStep={currentStep}
        handleStepClick={handleStepClick}
      />
      <div className="flex flex-grow flex-col overflow-hidden">
        {changePlanStepsConfig[currentStep].renderStep()}
      </div>
      {isLoading && renderLoader()}
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("change-plan-view-root")!
);
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
