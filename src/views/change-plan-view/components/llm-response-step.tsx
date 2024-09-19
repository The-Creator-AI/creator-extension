import * as React from "react";
import { useState, useEffect } from "react";
import Markdown from "markdown-to-jsx";
import "../ChangePlanView.scss";
import JsonResponse from "./json-renderer";
import { parseJsonResponse } from "../../../utils/parse-json";

interface LlmResponseStepProps {
    llmResponse: string;
}

const LlmResponseStep: React.FC<LlmResponseStepProps> = ({ llmResponse }) => {
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
                return <JsonResponse jsonData={parsedResponse} />;
            case 'markdown':
                return <Markdown>{llmResponse}</Markdown>;
            default:
                return null;
        }
    };

    return (
        <div
            className="overflow-y-auto"
            data-testid="change-plan-llm-response-step"
        >
            <div data-testid="llm-response-container">
                {renderResponse()}
            </div>
        </div>
    );
};

export default LlmResponseStep;
