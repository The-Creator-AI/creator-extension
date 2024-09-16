import * as React from 'react';
import { useEffect, useState } from 'react';
import { LlmServiceEnum } from '@/backend/types/llm-service.enum';
import { ClientPostMessageManager } from '@/ipc/client-ipc';
import { ClientToServerChannel, ServerToClientChannel } from '@/ipc/channels.enum'; 

const ApiKeyManagement: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<Record<LlmServiceEnum, string[]>>(
    Object.values(LlmServiceEnum).reduce((acc, service) => ({ ...acc, [service]: [] }), {} as any)
  );
  const [newApiKey, setNewApiKey] = useState('');
  const [selectedService, setSelectedService] = useState<LlmServiceEnum | null>(null);

  const clientIpc = ClientPostMessageManager.getInstance();

  useEffect(() => {
    const fetchApiKeys = async () => {
      clientIpc.sendToServer(ClientToServerChannel.GetLLMApiKeys, {});
    };

    fetchApiKeys();
  }, []);

  useEffect(() => {
    const handleSendLLMApiKeys = (message: { apiKeys: Record<LlmServiceEnum, string[]> | undefined }) => {
      setApiKeys(message.apiKeys || {} as any);
    };

    clientIpc.onServerMessage(ServerToClientChannel.SendLLMApiKeys, handleSendLLMApiKeys);
  }, []); 

  const handleAddApiKey = async () => {
    if (newApiKey.trim() === '' || !selectedService) {
      return;
    }

    clientIpc.sendToServer(ClientToServerChannel.SetLLMApiKey, { service: selectedService, apiKey: newApiKey });
  };

  const handleDeleteApiKey = async (service: LlmServiceEnum, apiKey: string) => {
    clientIpc.sendToServer(ClientToServerChannel.DeleteLLMApiKey, { service, apiKeyToDelete: apiKey });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">API Key Management</h2>
      <div className="mb-4">
        <label htmlFor="serviceSelect" className="block text-sm font-medium text-gray-700">
          Select Service:
        </label>
        <select
          id="serviceSelect"
          value={selectedService || ''}
          onChange={(e) => setSelectedService(e.target.value as LlmServiceEnum)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Select a service</option>
          {Object.values(LlmServiceEnum).map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="apiKeyInput" className="block text-sm font-medium text-gray-700">
          API Key:
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            name="apiKeyInput"
            id="apiKeyInput"
            className="focus:ring-indigo-500 focus:border-indigo-500 flex-grow block w-full min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300 p-2"
            placeholder="Enter your API key"
            value={newApiKey}
            onChange={(e) => setNewApiKey(e.target.value)}
          />
          <button
            onClick={handleAddApiKey}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add
          </button>
        </div>
      </div>

      {Object.entries(apiKeys).map(([service, keys]) => (
        <div key={service} className="mb-6">
          <h3 className="text-lg font-medium text-gray-900">{service}</h3>
          <ul className="list-disc pl-5">
            {keys.map((apiKey, index) => (
              <li key={index} className="flex items-center justify-between py-2">
                <span className="truncate">{apiKey}</span>
                <button
                  onClick={() => handleDeleteApiKey(service as LlmServiceEnum, apiKey)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ApiKeyManagement;
