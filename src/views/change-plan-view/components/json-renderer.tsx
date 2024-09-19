import * as React from "react";
import FileCard from './FileCard'; // Import the new FileCard component

const JsonResponse: React.FC<{ jsonData: any }> = ({ jsonData }) => {
    return jsonData ? (
        <div className="json-container pt-2">
            <h3 className="text-lg font-bold mb-2 px-4">{jsonData.title}</h3>
            <p className="text-gray-700 mb-4 px-4">{jsonData.description}</p>
            
            <div className="flex flex-row overflow-x-auto">
                {jsonData.code_plan.map((item: any, index: number) => {
                    if (item.filename) {
                        return (
                            <FileCard
                                key={index}
                                fileName={item.filename?.split('/').pop() || ''}
                                operation={item.operation}
                                recommendations={item.recommendations}
                                filePath={item.filename}
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