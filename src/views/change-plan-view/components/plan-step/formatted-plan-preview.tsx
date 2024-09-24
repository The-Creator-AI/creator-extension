import * as React from "react";
import FileCard from './components/file-card'; // Import the new FileCard component
import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { changePlanViewStoreStateSubject } from '@/views/change-plan-view/store/change-plan-view.store';
import { ClientPostMessageManager } from '@/ipc/client-ipc';
import { ClientToServerChannel } from '@/ipc/channels.enum';
import { MdArrowBack, MdArrowForward } from 'react-icons/md';

const FormattedPlanPreview: React.FC<{ jsonData: any }> = ({ jsonData }) => {
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
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
        clientIpc.sendToServer(ClientToServerChannel.RequestOpenFile, {
            filePath: jsonData.code_plan[currentFileIndex]?.filename
        });
    }, [currentFileIndex]);

    useEffect(() => {
        const matchingCardIndex = jsonData.code_plan.findIndex(
            (item: any) => item?.filename && activeTab && activeTab.endsWith(item.filename)
        );
        if (matchingCardIndex !== -1) {
            setCurrentFileIndex(matchingCardIndex);
        }
    }, [activeTab, jsonData.code_plan]);


    const handleDotClick = (index: number) => {
        setCurrentFileIndex(index);
    };

    const handleArrowClick = (direction: 'left' | 'right') => {
        if (direction === 'left' && currentFileIndex > 0) {
            setCurrentFileIndex(currentFileIndex - 1);
        } else if (direction === 'right' && currentFileIndex < jsonData.code_plan.length - 1) {
            setCurrentFileIndex(currentFileIndex + 1);
        }
    };

    return jsonData ? (
        <div className="formatted-plan-preview min-h-0 pt-2 flex flex-col flex-grow focus:outline-none" onKeyDown={handleKeyDown} tabIndex={0}>
            <h3 className="flex justify-center text-xs font-bold mb-2 px-4 text-center">{jsonData.title}</h3>
            <p className="flex justify-center text-gray-700 px-4 text-center max-h-10 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>{jsonData.description}</p>
            {/* Navigation Arrows */}
            <div className="flex justify-between items-center my-4">
                <MdArrowBack
                    size={24}
                    className={`cursor-pointer ${currentFileIndex === 0 ? 'text-gray-400' : 'text-blue-500'}`}
                    onClick={() => handleArrowClick('left')}
                />
                {/* Pagination Dots */}
                <div className="flex justify-center">
                    {jsonData.code_plan.map((_: any, index: number) => (
                        <div
                            key={index}
                            onClick={() => handleDotClick(index)} // Add onClick handler for each dot
                            className={`w-2 h-2 rounded-full mx-1 cursor-pointer ${index === currentFileIndex ? 'bg-blue-500' : 'bg-gray-400'}`}
                        />
                    ))}
                </div>
                <MdArrowForward
                    size={24}
                    className={`cursor-pointer ${currentFileIndex === jsonData.code_plan.length - 1 ? 'text-gray-400' : 'text-blue-500'}`}
                    onClick={() => handleArrowClick('right')}
                />
            </div>
            <div className="flex flex-grow overflow-x-hidden mx-4"> 
                {jsonData.code_plan.map((item: any, index: number) => {
                    if (item?.filename && index === currentFileIndex) { // Only render the card at the currentFileIndex
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
