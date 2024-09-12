import * as React from 'react';
import Markdown from 'markdown-to-jsx';
import '../index.scss';

interface LlmResponseStepProps {
    llmResponse: string;
}

const LlmResponseStep: React.FC<LlmResponseStepProps> = ({ llmResponse }) => (
    <div className="p-4" data-testid="change-plan-llm-response-step">
        <div className="p-4" data-testid="llm-response-container">
            <Markdown>{llmResponse}</Markdown>
        </div>
    </div>
);

export default LlmResponseStep;
