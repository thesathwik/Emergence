import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService, ApiKey } from '../services/userService';


const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const data = await userService.getApiKeys();
      setApiKeys(data.api_keys || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = async () => {
    try {
      const data = await userService.generateApiKey(newKeyName || 'Default Key');
      setGeneratedKey(data.api_key_details.api_key);
      setNewKeyName('');
      setShowNewKeyForm(false);
      fetchApiKeys(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate API key');
    }
  };

  const revokeApiKey = async (keyId: number) => {
    if (!window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await userService.revokeApiKey(keyId);
      fetchApiKeys(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke API key');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      alert('API key copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600 mt-1">Manage your API keys and account preferences</p>
          </div>

          <div className="p-6">
            {/* User Info Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-gray-900 mt-1">{user?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900 mt-1">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* API Keys Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
                  <p className="text-gray-600 text-sm">Use these keys to authenticate your agents with the platform</p>
                </div>
                <button
                  onClick={() => setShowNewKeyForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Generate New Key
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {generatedKey && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-green-900 mb-2">🎉 New API Key Generated!</h3>
                  <p className="text-green-700 text-sm mb-3">
                    Store this key securely. You won't be able to see it again.
                  </p>
                  <div className="flex items-center space-x-2">
                    <code className="bg-white px-3 py-2 rounded border text-sm font-mono flex-1">
                      {generatedKey}
                    </code>
                    <button
                      onClick={() => copyToClipboard(generatedKey)}
                      className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                  <button
                    onClick={() => setGeneratedKey(null)}
                    className="mt-2 text-green-600 hover:text-green-800 text-sm"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {showNewKeyForm && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-blue-900 mb-2">Generate New API Key</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        Key Name (optional)
                      </label>
                      <input
                        type="text"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="e.g., My Python Agent Key"
                        className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={generateApiKey}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                      >
                        Generate Key
                      </button>
                      <button
                        onClick={() => setShowNewKeyForm(false)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* API Keys List */}
              <div className="space-y-3">
                {apiKeys.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2m6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2m6 0H9" />
                    </svg>
                    <p>No API keys found</p>
                    <p className="text-sm">Generate your first API key to start using the Emergence Agent SDK</p>
                  </div>
                ) : (
                  apiKeys.map((key) => (
                    <div key={key.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900">
                              {key.key_name || 'Unnamed Key'}
                            </h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              key.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {key.is_active ? 'Active' : 'Revoked'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                              {key.api_key.substring(0, 12)}...{key.api_key.substring(key.api_key.length - 4)}
                            </code>
                            <button
                              onClick={() => copyToClipboard(key.api_key)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Copy Full Key
                            </button>
                          </div>
                          <div className="text-sm text-gray-500">
                            Created: {new Date(key.created_at).toLocaleDateString()}
                            {key.expires_at && (
                              <span className="ml-4">
                                Expires: {new Date(key.expires_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        {key.is_active && (
                          <button
                            onClick={() => revokeApiKey(key.id)}
                            className="text-red-600 hover:text-red-800 text-sm ml-4"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Usage Instructions */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">🐍 Using Your API Key with Python SDK</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>1. Install the Emergence Agent SDK:</p>
                  <code className="block bg-blue-100 px-2 py-1 rounded font-mono">
                    pip install emergence-agent
                  </code>
                  
                  <p>2. Set your API key as an environment variable:</p>
                  <code className="block bg-blue-100 px-2 py-1 rounded font-mono">
                    export EMERGENCE_API_KEY="your_api_key_here"
                  </code>
                  
                  <p>3. Create your agent:</p>
                  <pre className="bg-blue-100 px-2 py-2 rounded font-mono text-xs overflow-x-auto">
{`from emergence_agent import Agent

class MyAgent(Agent):
    def setup(self):
        self.declare_capability("greeting", "Say hello")
    
    def handle_request(self, request_type, data):
        return {"message": "Hello from Python!"}

with MyAgent(name="my-agent") as agent:
    print("🤖 Agent registered with platform!")`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;