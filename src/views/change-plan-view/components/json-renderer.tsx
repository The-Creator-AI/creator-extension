import * as React from "react";
import FileCard from './FileCard'; // Import the new FileCard component
import { useState, useRef, useEffect } from 'react';

const JsonResponse: React.FC<{ jsonData: any }> = ({ jsonData }) => {
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const fileCardContainerRef = useRef<HTMLDivElement>(null);

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

    return jsonData ? (
        <div className="json-container pt-2" onKeyDown={handleKeyDown} tabIndex={0}> {/* Added tabIndex to make the container focusable */}
            <h3 className="text-lg font-bold mb-2 px-4">{jsonData.title}</h3>
            <p className="text-gray-700 mb-4 px-4">{jsonData.description}</p>
            {/* Pagination Dots */}
            <div className="flex justify-center my-4">
                {jsonData.code_plan.map((_: any, index: number) => (
                    <div
                        key={index}
                        className={`w-2 h-2 rounded-full mx-1 ${index === currentFileIndex ? 'bg-blue-500' : 'bg-gray-400'}`}
                    />
                ))}
            </div>
            <div className="flex flex-row overflow-x-auto scroll-smooth mx-4" ref={fileCardContainerRef}>
                {jsonData.code_plan.map((item: any, index: number) => {
                    if (item.filename) {
                        return (
                            <FileCard
                                key={index}
                                fileName={item.filename?.split('/').pop() || ''}
                                operation={item.operation}
                                recommendations={item.recommendations}
                                filePath={item.filename}
                                fileNumber={index + 1} // Pass the file number
                                totalFiles={jsonData.code_plan.length} // Pass the total file count
                            />
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    ) : null;
};

export default JsonResponse;