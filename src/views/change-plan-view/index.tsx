import * as React from "react";
import { useState, useEffect } from "react";
import * as ReactDOM from "react-dom/client";
import { FaSpinner } from "react-icons/fa"; // Import spinner icon
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
import { setChangePlanViewState as setState } from "./store/change-plan-view.logic";
import {
  changePlanViewStoreStateSubject,
} from "./store/change-plan-view.store";
import { FileNode } from "src/types/file-node";
import FileTree from "../../components/file-tree/FileTree";

const App = () => {
  const {
    changeDescription,
    isLoading,
    llmResponse,
    currentStep,
  } = useStore(changePlanViewStoreStateSubject);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
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
              updateSelectedFiles={setSelectedFiles}
              updateRecentFiles={setRecentFiles}
            />
          ))}
          {!files.length && <div className="text-gray-500">Loading files...</div>}
        </div>
      ),
    },
    [ChangePlanSteps.Plan]: {
      indicatorText: "Plan",
      renderStep: () => <>
        <LlmResponseStep llmResponse={llmResponse} />
        <ChangeInputStep
          changeDescription={changeDescription}
          isLoading={isLoading}
          handleChange={setState("changeDescription")}
          handleSubmit={handleSubmit}
        />
      </>,
    },
  };

  React.useEffect(() => {
    clientIpc.onServerMessage(
      ServerToClientChannel.SendMessage,
      ({ message }) => {
        setState("isLoading")(false);
        setState("llmResponse")(message);
        setState("currentStep")(ChangePlanSteps.Plan);
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

  const handleSubmit = () => {
    setState("isLoading")(true);
    clientIpc.sendToServer(ClientToServerChannel.SendMessage, {
      message: changeDescription,
    });
  };

  const handleStepClick = (step: ChangePlanSteps) => {
    setState("currentStep")(step);
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
root.render(<App />);
