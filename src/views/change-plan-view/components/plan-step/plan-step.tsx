import { FileNode } from '@/types/file-node';
import PlanInputBox from './plan-input-box';
import { setChangePlanViewState as setState } from '@/views/change-plan-view/store/change-plan-view.logic';
import { getChangePlanViewState } from '@/views/change-plan-view/store/change-plan-view.store';
import Markdown from "markdown-to-jsx";
import * as React from "react";
import { useEffect, useState } from "react";
import "../../change-plan.view.scss";
import FormattedPlanPreview from "./formatted-plan-preview";
import { parseJsonResponse } from '@/utils/parse-json';

interface PlanStepProps {
    llmResponse: string;
    files: FileNode[],
}

const PlanStep: React.FC<PlanStepProps> = ({ llmResponse, files }) => {
    const [responseType, setResponseType] = useState<'json' | 'markdown' | null>(null);
    const [parsedResponse, setParsedResponse] = useState<any>(null);

    useEffect(() => {
        const jsonData = parseJsonResponse(llmResponse);
        if (jsonData) {
            setResponseType('json');
            setParsedResponse(jsonData);
        } else {
            setResponseType('markdown');
        }
    }, [llmResponse]);

    const renderResponse = () => {
        switch (responseType) {
            case 'json':
                return <FormattedPlanPreview jsonData={parsedResponse} />;
            case 'markdown':
                return <Markdown>{llmResponse}</Markdown>;
            default:
                return null;
        }
    };

    return (
        <div
            className="plan-step flex flex-grow flex-col min-h-0"
        >
            <div className="flex flex-grow flex-col min-h-0">
                {renderResponse()}
            </div>
            <PlanInputBox
                isUpdateRequest={!!(
                    getChangePlanViewState("chatHistory").length > 0 && llmResponse
                )}
                handleChange={setState("changeDescription")}
                files={files}
            />
        </div>
    );
};

export default PlanStep;
