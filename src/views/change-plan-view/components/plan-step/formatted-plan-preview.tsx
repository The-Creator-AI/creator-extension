import * as React from "react";
import FileCard from './components/file-card'; // Import the new FileCard component
import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { changePlanViewStoreStateSubject } from '@/views/change-plan-view/store/change-plan-view.store';
import { ClientPostMessageManager } from '@/ipc/client-ipc';
import { ClientToServerChannel } from '@/ipc/channels.enum';

const FormattedPlanPreview: React.FC<{ jsonData: any }> = ({ jsonData }) => {
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const fileCardContainerRef = useRef<HTMLDivElement>(null);
    const { activeTab } = useStore(changePlanViewStoreStateSubject);
    const clientIpc = ClientPostMessageManager.getInstance();

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'ArrowLeft' && currentFileIndex > 0) {
            setCurrentFileIndex(currentFileIndex - 1);
        } else if (e.key === 'ArrowRight' && currentFileIndex < jsonData.code_plan.length - 1) {
            setCurrentFileIndex(currentFileIndex + 1);
        }
    };

    useEffect(() => {
        if (fileCardContainerRef.current) {
            const cardWidth = fileCardContainerRef.current.children[0].clientWidth; // Assuming all cards have the same width
            fileCardContainerRef.current.scrollLeft = cardWidth * currentFileIndex;
        }
    }, [currentFileIndex]);

    useEffect(() => {
        const matchingCardIndex = jsonData.code_plan.findIndex(
            (item: any) => item.filename && activeTab && activeTab.endsWith(item.filename)
        );
        if (matchingCardIndex !== -1) {
            setCurrentFileIndex(matchingCardIndex);
        }
    }, [activeTab, jsonData.code_plan]);


    const handleDotClick = (index: number) => {
        setCurrentFileIndex(index);
    };

    return jsonData ? (
        <div className="formatted-plan-preview pt-2 flex flex-col flex-grow" onKeyDown={handleKeyDown} tabIndex={0}>
            <h3 className="flex justify-center text-xs font-bold mb-2 px-4 text-center">{jsonData.title}</h3>
            <p className="flex justify-center text-gray-700 mb-4 px-4 text-center">{jsonData.description}</p>
            {/* Pagination Dots */}
            <div className="flex justify-center my-4">
                {jsonData.code_plan.map((_: any, index: number) => (
                    <div
                        key={index}
                        onClick={() => handleDotClick(index)} // Add onClick handler for each dot
                        className={`w-2 h-2 rounded-full mx-1 cursor-pointer ${index === currentFileIndex ? 'bg-blue-500' : 'bg-gray-400'}`}
                    />
                ))}
            </div>
            <div className="flex flex-grow overflow-x-hidden scroll-smooth mx-4">
                {jsonData.code_plan.map((item: any, index: number) => {
                    if (item.filename && index === currentFileIndex) { // Only render the card at the currentFileIndex
                        return (
                            <FileCard
                                key={index}
                                fileName={item.filename?.split('/').pop() || ''}
                                operation={item.operation}
                                recommendations={item.recommendations}
                                filePath={item.filename}
                                fileNumber={index + 1}
                                totalFiles={jsonData.code_plan.length}
                            />
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    ) : null;
};

export default FormattedPlanPreview;