import * as React from 'react';
import '../index.scss';

interface ChangeInputStepProps {
    changeDescription: string;
    isLoading: boolean;
    handleChange: (value: string) => void;
    handleSubmit: () => void;
}

const ChangeInputStep: React.FC<ChangeInputStepProps> = ({ changeDescription, isLoading, handleChange, handleSubmit }) => (
    <div className="flex flex-grow flex-col">
        <div className="p-4 flex flex-col grow"/>
        <div className="p-4 flex flex-col" data-testid="change-plan-input-step">
        <textarea
            className="grow p-2 border border-gray-300 rounded resize-y font-normal mb-2 min-h-[50px] max-h-[200px] overflow-hidden"
            placeholder="Describe the code changes you want to plan..."
            value={changeDescription}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isLoading}
            data-testid="change-description-textarea"
        />
        <button
            className="py-2 px-4 bg-blue-500 text-white rounded cursor-pointer self-end hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={isLoading}
            data-testid="submit-change-description-button"
        >
            {isLoading ? 'Generating...' : 'Submit'}
        </button>
    </div>
    </div>
);

export default ChangeInputStep;
