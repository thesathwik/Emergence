import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Agent } from '../types';

export const useCategoryCounts = () => {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategoryCounts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all agents to calculate category counts
      const response = await apiService.getAgents();
      const agents = response.agents;
      
      // Calculate counts for each category
      const counts: Record<string, number> = {
        '': agents.length, // Total count
      };
      
      agents.forEach((agent: Agent) => {
        const category = agent.category;
        counts[category] = (counts[category] || 0) + 1;
      });
      
      setCategoryCounts(counts);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch category counts');
      console.error('Error fetching category counts:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateCategoryCounts = (agents: Agent[]) => {
    const counts: Record<string, number> = {
      '': agents.length, // Total count
    };
    
    agents.forEach((agent: Agent) => {
      const category = agent.category;
      counts[category] = (counts[category] || 0) + 1;
    });
    
    setCategoryCounts(counts);
  };

  useEffect(() => {
    fetchCategoryCounts();
  }, []);

  return {
    categoryCounts,
    loading,
    error,
    fetchCategoryCounts,
    updateCategoryCounts
  };
};
