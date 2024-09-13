import * as React from "react";

const JsonResponse: React.FC<{ jsonData: any }> = ({ jsonData }) => {
    if (!jsonData) {
        return null;
    }

    return (
        <div className="json-container p-4">
            <h3 className="text-xl font-bold mb-2">{jsonData.title}</h3>
            <p className="text-gray-700 mb-4">{jsonData.description}</p>
            <div className="list-disc list-inside">
                {jsonData.code_plan.map((item: any, index: number) => (
                    <div key={index} className="mb-2">
                        {item.command ? (
                            <div>
                                <strong className="font-medium">Command:</strong> {item.command}
                                <br />
                                <strong className="font-medium">Description:</strong> {item.description}
                            </div>
                        ) : (
                            <div className="bg-orange-500 p-4">
                                <div className="flex flex-col" title={item.filename}>
                                    <div className="font-medium font-semibold">{item.filename?.split('/').pop()}</div>
                                    <div className="text-gray-700 text-sm whitespace-nowrap overflow-hidden text-ellipsis font-normal">
                                        {item.filename.split('/').slice(0, -1).join('/')}/
                                    </div>
                                </div>
                                <br />
                                {/* <strong className="font-medium">Operation:</strong> {item.operation} */}
                                <br />
                                {/* <strong className="font-medium">Recommendations:</strong> */}
                                <div className="list-disc list-inside">
                                    {item.recommendations.map(
                                        (recommendation: any, recIndex: number) => (
                                            <div key={recIndex} className="mb-1 bg-red-400 p-2">
                                                {Array.isArray(recommendation) ? ( // Check if it's an array of alternatives
                                                    <div className="list-disc list-inside ml-4">
                                                        {recommendation.map(
                                                            (alternative: string, altIndex: number) => (
                                                                <div key={altIndex} className="bg-red-400 p-2">{alternative}</div>
                                                            )
                                                        )}
                                                    </div>
                                                ) : (
                                                    recommendation
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JsonResponse;
