import React from 'react';

interface AgentFiltersProps {
  capabilities: string[];
  statuses: string[];
  types: string[];
  selectedCapabilities: string[];
  selectedStatus: string[];
  selectedTypes: string[];
  onChange: (type: string, values: string[]) => void;
}

const AgentFilters: React.FC<AgentFiltersProps> = ({
  capabilities,
  statuses,
  types,
  selectedCapabilities,
  selectedStatus,
  selectedTypes,
  onChange
}) => {
  const handleCapabilityToggle = (capability: string) => {
    const newSelection = selectedCapabilities.includes(capability)
      ? selectedCapabilities.filter(c => c !== capability)
      : [...selectedCapabilities, capability];
    onChange('capabilities', newSelection);
  };

  const handleStatusToggle = (status: string) => {
    const newSelection = selectedStatus.includes(status)
      ? selectedStatus.filter(s => s !== status)
      : [...selectedStatus, status];
    onChange('status', newSelection);
  };

  const handleTypeToggle = (type: string) => {
    const newSelection = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    onChange('types', newSelection);
  };

  const clearAllFilters = () => {
    onChange('capabilities', []);
    onChange('status', []);
    onChange('types', []);
  };

  const hasActiveFilters = selectedCapabilities.length > 0 || selectedStatus.length > 0 || selectedTypes.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Filter Agents</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-red-600 hover:text-red-800 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            Clear all filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Filters */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
          <div className="space-y-2">
            {statuses.map(status => (
              <label key={status} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedStatus.includes(status)}
                  onChange={() => handleStatusToggle(status)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600 capitalize flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    status === 'active' ? 'bg-green-400' :
                    status === 'busy' ? 'bg-yellow-400' :
                    status === 'idle' ? 'bg-blue-400' : 'bg-gray-400'
                  }`} />
                  {status}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Type Filters */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Agent Type</h4>
          <div className="space-y-2">
            {types.map(type => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => handleTypeToggle(type)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">
                  {type}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Capability Filters */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Capabilities</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {capabilities.map(capability => (
              <label key={capability} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedCapabilities.includes(capability)}
                  onChange={() => handleCapabilityToggle(capability)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">
                  {capability.replace('-', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            
            {selectedStatus.map(status => (
              <span
                key={`status-${status}`}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
              >
                Status: {status}
                <button
                  onClick={() => handleStatusToggle(status)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                </button>
              </span>
            ))}
            
            {selectedTypes.map(type => (
              <span
                key={`type-${type}`}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
              >
                Type: {type}
                <button
                  onClick={() => handleTypeToggle(type)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                </button>
              </span>
            ))}
            
            {selectedCapabilities.map(capability => (
              <span
                key={`cap-${capability}`}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800"
              >
                {capability.replace('-', ' ')}
                <button
                  onClick={() => handleCapabilityToggle(capability)}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentFilters;