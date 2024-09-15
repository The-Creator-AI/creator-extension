import * as React from 'react';
import { VSCodeTextArea } from '@vscode/webview-ui-toolkit/react';
import '../ChangePlanView.scss';
import { BsSend } from 'react-icons/bs';
import { TextAreaResize } from '@vscode/webview-ui-toolkit';

interface ChangeInputStepProps {
    changeDescription: string;
    isLoading: boolean;
    handleChange: (value: string) => void;
    handleSubmit: () => void;
    isUpdateRequest?: boolean;
}

const ChangeInputStep: React.FC<ChangeInputStepProps> = ({ isUpdateRequest, changeDescription, isLoading, handleChange, handleSubmit }) => (
    <div className="flex flex-grow flex-col">
        <div className="p-4 flex flex-col grow" />
        <div className="p-4 flex flex-col relative" data-testid="change-plan-input-step">
            <VSCodeTextArea
                className="grow p-2 border border-gray-300 rounded resize-y font-normal mb-2 min-h-[50px] max-h-[200px] overflow-hidden pr-10"
                placeholder={isUpdateRequest ? "Describe the changes you want to make to the plan..." : "Describe the code changes you want to plan..."}
                value={changeDescription}
                onChange={(e) => handleChange(e.target.value)}
                disabled={isLoading}
                data-testid="change-description-textarea"
                resize={TextAreaResize.vertical}
            />
            <BsSend
                className="absolute right-7 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-blue-500"
                size={20}
                onClick={handleSubmit}
                data-testid="submit-change-description-button"
            />
        </div>
    </div>
);

export default ChangeInputStep;
