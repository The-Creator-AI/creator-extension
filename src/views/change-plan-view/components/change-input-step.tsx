import * as React from 'react';
import '../ChangePlanView.scss';
import { BsSend } from 'react-icons/bs';
import AutoResizingTextarea from '@/components/AutoResizingTextarea';
import { ClientPostMessageManager } from '@/ipc/client-ipc';
import { ClientToServerChannel, ServerToClientChannel } from '@/ipc/channels.enum';
import { useStore } from '@/store/useStore';
import { changePlanViewStoreStateSubject } from '@/views/change-plan-view/store/change-plan-view.store';

interface ChangeInputStepProps {
    changeDescription: string;
    isLoading: boolean;
    handleChange: (value: string) => void;
    handleSubmit: () => void;
    isUpdateRequest?: boolean;
}

const ChangeInputStep: React.FC<ChangeInputStepProps> = ({ isUpdateRequest, changeDescription, isLoading, handleChange, handleSubmit }) => {
    const { selectedFiles } = useStore(changePlanViewStoreStateSubject);
    const [suggestions, setSuggestions] = React.useState<string[]>([]);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = React.useState<number | null>(null);
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const inputRef = React.useRef<HTMLTextAreaElement>(null);

    const clientIpc = ClientPostMessageManager.getInstance();

    const handleSuggestionAccept = (suggestion: string) => {
        handleChange(
            changeDescription.split(' ').slice(0, -1).join(' ') + ' '
            + suggestion + ' ');
        setSelectedSuggestionIndex(null);
        setShowSuggestions(false);
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showSuggestions) {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedSuggestionIndex((prevIndex) => (prevIndex === null || prevIndex === 0) ? suggestions.length - 1 : prevIndex - 1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedSuggestionIndex((prevIndex) => (prevIndex === null || prevIndex === suggestions.length - 1) ? 0 : prevIndex + 1);
            } else if (e.key === 'Enter') {
                if (selectedSuggestionIndex !== null) {
                    e.preventDefault();
                    const selectedSuggestion = suggestions[selectedSuggestionIndex];
                    handleSuggestionAccept(selectedSuggestion);
                }
            } else if (e.key === 'Escape') {
                setShowSuggestions(false);
            }
        }
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || e.altKey)) {
            e.preventDefault();
            handleSubmit();
        }
    };

    React.useEffect(() => {
        const fetchSuggestions = () => {
            if (changeDescription.split(' ').pop().startsWith('@')) {
                clientIpc.sendToServer(ClientToServerChannel.RequestSymbols, {
                    query: changeDescription.split(' ').pop().slice(1)
                });
            } else {
                setShowSuggestions(false); // Hide suggestions if "@" is not the last character
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300); // Adjust delay as needed

        return () => clearTimeout(timeoutId);
    }, [changeDescription, selectedFiles]);

    React.useEffect(() => {
        clientIpc.onServerMessage(ServerToClientChannel.SendSymbols, (message) => {
            const receivedSuggestions = (message.symbols || []).map((symbol: { name: string }) => symbol.name); // Adjust based on actual symbol structure
            setSuggestions(receivedSuggestions);
            setShowSuggestions(true);
        });
    }, []);


    return (
        <div className="flex flex-grow flex-col">
            <div className="relative p-4 flex flex-col relative" data-testid="change-plan-input-step">
                {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute bottom-full bg-sidebar-bg left-0 mb-1 border border-gray-300 rounded max-h-40 overflow-y-auto shadow-lg z-10 m-4"
                        style={{
                            width: inputRef.current?.clientWidth,
                        }}>
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                className={`p-2 cursor-pointer hover:bg-hover-bg ${index === selectedSuggestionIndex ? 'bg-hover-bg' : ''}`}
                                onClick={() => {
                                    handleSuggestionAccept(suggestion);
                                }}
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}
                <AutoResizingTextarea
                    ref={inputRef}
                    className="p-2 border border-gray-300 rounded font-normal mb-2 pr-10"
                    placeholder={isUpdateRequest ? "Describe the changes you want to make to the plan..." : "Describe the code changes you want to plan..."}
                    value={changeDescription}
                    onChange={(e) => handleChange(e.target.value)}
                    disabled={isLoading}
                    data-testid="change-description-textarea"
                    onKeyDown={handleKeyDown}
                    minRows={2}
                    maxRows={10}
                    autoFocus
                />
            </div>
            <BsSend
                className="absolute right-7 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-blue-500"
                size={20}
                onClick={handleSubmit}
                data-testid="submit-change-description-button"
            />
        </div>
    );
};

export default ChangeInputStep;
