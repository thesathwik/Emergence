import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface Capability {
  id: number;
  name: string;
  display_name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

interface CapabilitySelectorProps {
  selectedCapabilities: number[];
  onCapabilitiesChange: (capabilities: number[]) => void;
  disabled?: boolean;
}

const CapabilitySelector: React.FC<CapabilitySelectorProps> = ({
  selectedCapabilities,
  onCapabilitiesChange,
  disabled = false
}) => {
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCapabilities();
  }, []);

  const loadCapabilities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getCapabilities();
      setCapabilities(response.capabilities || []);
    } catch (err: any) {
      console.error('Error loading capabilities:', err);
      setError('Failed to load capabilities');
    } finally {
      setLoading(false);
    }
  };

  const filteredCapabilities = capabilities.filter(capability =>
    capability.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    capability.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCapabilityToggle = (capabilityId: number) => {
    if (disabled) return;

    const isSelected = selectedCapabilities.includes(capabilityId);
    let newSelection: number[];

    if (isSelected) {
      newSelection = selectedCapabilities.filter(id => id !== capabilityId);
    } else {
      newSelection = [...selectedCapabilities, capabilityId];
    }

    onCapabilitiesChange(newSelection);
  };

  const handleSelectAll = () => {
    if (disabled) return;
    onCapabilitiesChange(filteredCapabilities.map(cap => cap.id));
  };

  const handleDeselectAll = () => {
    if (disabled) return;
    onCapabilitiesChange([]);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse space-y-2">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-1/3 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-800 text-sm">{error}</span>
          <button
            onClick={loadCapabilities}
            className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-700">
            Agent Capabilities
          </h3>
          <span className="text-xs text-gray-500">
            ({selectedCapabilities.length} selected)
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search capabilities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            disabled={disabled}
          />
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled || filteredCapabilities.length === 0}
          >
            Select All
          </button>
          <button
            type="button"
            onClick={handleDeselectAll}
            className="text-xs text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled || selectedCapabilities.length === 0}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Capabilities grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredCapabilities.map((capability) => {
          const isSelected = selectedCapabilities.includes(capability.id);
          return (
            <div
              key={capability.id}
              className={`relative p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleCapabilityToggle(capability.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCapabilityToggle(capability.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={disabled}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {capability.display_name}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {capability.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCapabilities.length === 0 && searchTerm && (
        <div className="text-center py-6">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No capabilities found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No capabilities match your search term "{searchTerm}"
          </p>
        </div>
      )}

      {/* Selected capabilities summary */}
      {selectedCapabilities.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              Selected Capabilities ({selectedCapabilities.length})
            </span>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={disabled}
            >
              Clear All
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedCapabilities.map((capId) => {
              const capability = capabilities.find(cap => cap.id === capId);
              if (!capability) return null;
              return (
                <span
                  key={capId}
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {capability.display_name}
                  <button
                    type="button"
                    onClick={() => handleCapabilityToggle(capId)}
                    className="ml-1 text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={disabled}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CapabilitySelector;