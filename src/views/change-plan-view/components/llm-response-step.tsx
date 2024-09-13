import * as React from "react";
import { useState, useEffect } from "react";
import Markdown from "markdown-to-jsx";
import "../index.scss";

interface LlmResponseStepProps {
    llmResponse: string;
}

const LlmResponseStep: React.FC<LlmResponseStepProps> = ({ llmResponse }) => {
    const [parsedResponse, setParsedResponse] = useState<any>(null);

    useEffect(() => {
        try {
            console.log({ llmResponse });
            const jsonStart = llmResponse.indexOf("\`\`\`json");
            const jsonEnd = llmResponse.lastIndexOf("\`\`\`") + 1;

            if (jsonStart !== -1 && jsonEnd !== -1) {
                const jsonStr = llmResponse.substring(jsonStart + 7, jsonEnd - 2)?.replaceAll('\n', '');
                console.log({ jsonStr });
                const parsedJson = JSON.parse(jsonStr);
                setParsedResponse(parsedJson);
            }
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
    }, [llmResponse]);

    const renderJson = (jsonData: any) => {
        if (!jsonData) {
            return null; // Or a loading indicator
        }

        return (
            <div className="json-container p-4 border rounded-md">
                <h3 className="text-xl font-bold mb-2">{jsonData.title}</h3>
                <p className="text-gray-700 mb-4">{jsonData.description}</p>
                <h4 className="text-lg font-semibold mb-2">Code Plan:</h4>
                <ul className="list-disc list-inside">
                    {jsonData.code_plan.map((item: any, index: number) => (
                        <li key={index} className="mb-2">
                            {item.command ? (
                                <div>
                                    <strong className="font-medium">Command:</strong> {item.command}
                                    <br />
                                    <strong className="font-medium">Description:</strong> {item.description}
                                </div>
                            ) : (
                                <div>
                                    <strong className="font-medium">Filename:</strong> {item.filename}
                                    <br />
                                    <strong className="font-medium">Operation:</strong> {item.operation}
                                    <br />
                                    <strong className="font-medium">Recommendations:</strong>
                                    <ul className="list-disc list-inside ml-4">
                                        {item.recommendations.map(
                                            (recommendation: any, recIndex: number) => (
                                                <li key={recIndex} className="mb-1">
                                                    {Array.isArray(recommendation) ? ( // Check if it's an array of alternatives
                                                        <ul className="list-disc list-inside ml-4">
                                                            {recommendation.map(
                                                                (alternative: string, altIndex: number) => (
                                                                    <li key={altIndex}>{alternative}</li>
                                                                )
                                                            )}
                                                        </ul>
                                                    ) : (
                                                        recommendation
                                                    )}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div
            className="p-4 overflow-y-auto"
            data-testid="change-plan-llm-response-step"
        >
            <div className="p-4" data-testid="llm-response-container">
                {parsedResponse ? (
                    renderJson(parsedResponse)
                ) : (
                    <Markdown>{llmResponse}</Markdown>
                )}
            </div>
        </div>
    );
};

export default LlmResponseStep;
