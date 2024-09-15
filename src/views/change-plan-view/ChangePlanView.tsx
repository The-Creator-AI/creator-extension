import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react";
import * as React from "react";
import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom/client";
import { FaSpinner, FaUndo } from "react-icons/fa"; // Import spinner and reset icons
import ErrorBoundary from "../../components/ErrorBoundary";
import { ClientPostMessageManager } from "../../ipc/client-ipc";
import { useStore } from "../../store/useStore";
import { FileNode } from "../../types/file-node";
import {
  ChangePlanSteps
} from "./change-plan-view.types";
import { getChangePlanTabs } from "./ChangePlanTabs";
import "./ChangePlanView.scss";
import StepIndicators from "./components/step-indicators";
import { setupChannelHandlers } from "./logic/setupChannelHandlers";
import {
  resetChangePlanViewStore,
  setChangePlanViewState as setState,
} from "./store/change-plan-view.logic";
import {
  changePlanViewStoreStateSubject,
  getChangePlanViewState,
} from "./store/change-plan-view.store";

const App = () => {
  const {
    changeDescription,
    isLoading,
    llmResponse,
    currentStep: currentTab,
    selectedFiles,
    activeTab,
  } = useStore(changePlanViewStoreStateSubject);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const [activeFile, setActiveFile] = useState<string>();

  const clientIpc = ClientPostMessageManager.getInstance();
  const changePlanTabs = getChangePlanTabs({
    clientIpc,
    files,
    llmResponse,
    changeDescription,
    isLoading,
    selectedFiles,
    recentFiles,
    activeFile,
    setRecentFiles,
    setActiveFile,
  });


  useEffect(() => {
    setupChannelHandlers(setFiles);
  }, []);

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
        changePlanStepsConfig={changePlanTabs}
        currentStep={currentTab}
        handleStepClick={handleStepClick}
      />
      <div className="flex flex-grow flex-col overflow-hidden">
        <VSCodeDropdown
          className="w-full p-2 mb-2"
        // placeholder="Select a plan"
        // value={selectedPlanTitle}
        // onChange={handlePlanChange}
        >
          {getChangePlanViewState("changePlans").map((plan) => (
            <VSCodeOption key={plan.planTitle} value={plan.planTitle}>
              {plan.planTitle}
            </VSCodeOption>
          ))}
        </VSCodeDropdown>
        {changePlanTabs[currentTab].renderStep()}
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