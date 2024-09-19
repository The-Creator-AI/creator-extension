import * as React from 'react';
import '../ChangePlanView.scss';
import { BsSend } from 'react-icons/bs';
import AutoResizingTextarea from '@/components/AutoResizingTextarea';
import { ClientPostMessageManager } from '@/ipc/client-ipc';
import { ClientToServerChannel, ServerToClientChannel } from '@/ipc/channels.enum';
import { useEffect, useState, useCallback, useRef } from 'react';
import useDebounce from '@/utils/use-debounce';
import { ChatMessage } from '@/backend/repositories/chat.respository';
import {getChangePlanViewState} from '@/views/change-plan-view/store/change-plan-view.store';

interface ChangeInputStepProps {
    handleChange: (value: string) => void;
    handleSubmit: () => void;
    isUpdateRequest?: boolean;
}

const ChangeInputStep: React.FC<ChangeInputStepProps> = ({ 
    isUpdateRequest, 
    handleChange, 
    handleSubmit,
}) => {
    const clientIpc = ClientPostMessageManager.getInstance();
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [cursorPosition, setCursorPosition] = useState<number>(0);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const selectedFiles = getChangePlanViewState("selectedFiles");
    const chatHistory = getChangePlanViewState("chatHistory");
    const changeDescription = getChangePlanViewState("changeDescription");
    const isLoading = getChangePlanViewState("isLoading");

    const requestSuggestions = useDebounce(() => {
        clientIpc.sendToServer(ClientToServerChannel.RequestAutocompleteSuggestions, { 
            inputText: changeDescription,
            chatHistory,
            selectedFiles,
        });
    }, 200);

    useEffect(() => {
        const handleAutocompleteSuggestions = (message: { suggestions: string[] }) => {
            console.log('Received suggestions:', message.suggestions);
            setSuggestions(message.suggestions || []);
            setSelectedIndex(-1);
        };

        clientIpc.onServerMessage(ServerToClientChannel.SendAutocompleteSuggestions, handleAutocompleteSuggestions);
    
        return () => {
            clientIpc.onServerMessage(ServerToClientChannel.SendAutocompleteSuggestions, () => {});
        }
    }, []); 

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        handleChange(e.target.value);
        setCursorPosition(e.target.selectionStart || 0);
        requestSuggestions();
    };

    const applySuggestion = (suggestion: string) => {
        const newChangeDescription = changeDescription.substring(0, cursorPosition) + suggestion + changeDescription.substring(cursorPosition);
        handleChange(newChangeDescription);
        setSuggestions([]);
        setSelectedIndex(-1);
        
        setTimeout(() => {
            if (textareaRef.current) {
                const newCursorPosition = cursorPosition + suggestion.length;
                textareaRef.current.selectionStart = newCursorPosition;
                textareaRef.current.selectionEnd = newCursorPosition;
                setCursorPosition(newCursorPosition);
                textareaRef.current.focus();
            }
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (suggestions.length > 0) {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prevIndex => (prevIndex + 1) % suggestions.length);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prevIndex => (prevIndex - 1 + suggestions.length) % suggestions.length);
                    break;
                case 'Enter':
                    if (selectedIndex !== -1) {
                        e.preventDefault();
                        applySuggestion(suggestions[selectedIndex]);
                    }
                    break;
                case 'Escape':
                    setSuggestions([]);
                    setSelectedIndex(-1);
                    break;
            }
        }
    };

    useEffect(() => {
        if (listRef.current && selectedIndex !== -1) {
            const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
            selectedElement.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex]);

    return (
        <div className="flex flex-grow flex-col">
            <div className="p-4 flex flex-col grow" />
            <div className="p-4 relative" data-testid="change-plan-input-step">
                <div className="relative">
                    <AutoResizingTextarea
                        ref={textareaRef}
                        className="p-2 border border-gray-300 rounded font-normal mb-2 pr-10 w-full"
                        placeholder={isUpdateRequest ? "Describe the changes you want to make to the plan..." : "Describe the code changes you want to plan..."}
                        value={changeDescription}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        data-testid="change-description-textarea"
                        minRows={2}
                        maxRows={10}
                        autoFocus
                    />
                    <BsSend
                        className="absolute right-2 bottom-4 text-gray-400 cursor-pointer hover:text-blue-500"
                        size={20}
                        onClick={handleSubmit}
                        data-testid="submit-change-description-button"
                    />
                    {suggestions.length > 0 && (
                        <ul
                            ref={listRef}
                            className="absolute bottom-full left-0 mb-1 bg-white border border-gray-300 rounded w-full max-h-40 overflow-y-auto shadow-lg z-10"
                        >
                            {suggestions.map((suggestion, index) => (
                                <li 
                                    key={index}
                                    className={`p-2 cursor-pointer ${index === selectedIndex ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                                    onClick={() => applySuggestion(suggestion)}
                                >
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChangeInputStep;