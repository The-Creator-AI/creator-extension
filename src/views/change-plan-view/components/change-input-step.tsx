import * as React from 'react';
import '../ChangePlanView.scss';
import { BsSend } from 'react-icons/bs';
import AutoResizingTextarea from '@/components/AutoResizingTextarea';

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
            <AutoResizingTextarea
                className="p-2 border border-gray-300 rounded font-normal mb-2 pr-10"
                placeholder={isUpdateRequest ? "Describe the changes you want to make to the plan..." : "Describe the code changes you want to plan..."}
                value={changeDescription}
                onChange={(e) => handleChange(e.target.value)}
                disabled={isLoading}
                data-testid="change-description-textarea"
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || e.altKey)) {
                        e.preventDefault();
                        handleSubmit();
                    }
                }}
                minRows={2}
                maxRows={10}
                autoFocus
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