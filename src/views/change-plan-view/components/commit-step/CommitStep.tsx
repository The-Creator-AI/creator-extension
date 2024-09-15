import React, { useEffect, useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { requestCommitMessageSuggestions } from '../../logic/requestCommitMessageSuggestions';
import { handleCommitMessageSuggestions } from '../../logic/handleCommitMessageSuggestions';
import { setChangePlanViewState } from '../../store/change-plan-view.logic';
import { useStore } from '@/store/useStore';
import { changePlanViewStoreStateSubject } from '@/views/change-plan-view/store/change-plan-view.store';
import { commitStagedChanges } from '../../logic/commitStagedChanges';

const CommitStep: React.FC = () => {
    const {
        commitSuggestions,
        commitSuggestionsLoading
    } = useStore(changePlanViewStoreStateSubject);

    useEffect(() => {
        setChangePlanViewState("commitSuggestionsLoading")(true);
        requestCommitMessageSuggestions();
        handleCommitMessageSuggestions();
    }, []);

    const handleCommit = async (message: string) => {
        commitStagedChanges(message);
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
        <div className="p-4">
            {commitSuggestionsLoading ? (
                <div className="flex flex-col items-center">
                    {renderLoader()}
                    <p className="text-gray-600">Loading commit message suggestions...</p>
                </div>
            ) : (
                <ul className="list-none">
                    {commitSuggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            className="p-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleCommit(suggestion)}
                        >
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
            {/* Optional: Add a manual commit message input field and button */}
            {/* <textarea className="border rounded p-2 w-full" placeholder="Commit Message" rows={4} /> */}
            {/* <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => handleCommit(manualMessage)}> */}
            {/*   Commit */}
            {/* </button> */}
        </div>
    );
};

export default CommitStep;