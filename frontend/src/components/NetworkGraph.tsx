import React, { useEffect, useRef, useMemo } from 'react';

interface Agent {
  id: string;
  name: string;
  type: string;
  capabilities: string[];
  status: 'active' | 'idle' | 'offline' | 'busy';
  lastSeen: string;
  connections: number;
  messagesHandled: number;
  responseTime: number;
}

interface Connection {
  source: string;
  target: string;
  type: 'call' | 'response' | 'collaboration';
  timestamp: string;
  status: 'active' | 'completed' | 'failed';
  method?: string;
  duration?: number;
}

interface NetworkGraphProps {
  agents: Agent[];
  connections: Connection[];
  isLoading?: boolean;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ agents, connections, isLoading }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Prepare graph data
  const graphData = useMemo(() => {
    const nodeMap = new Map();
    
    // Create nodes from agents
    const nodes = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      type: agent.type,
      status: agent.status,
      capabilities: agent.capabilities,
      connections: agent.connections,
      messagesHandled: agent.messagesHandled,
      responseTime: agent.responseTime,
      x: Math.random() * 400 + 50, // Initial random position
      y: Math.random() * 300 + 50,
      vx: 0,
      vy: 0
    }));

    nodes.forEach(node => nodeMap.set(node.id, node));

    // Create edges from connections
    const edges = connections
      .filter(conn => nodeMap.has(conn.source) && nodeMap.has(conn.target))
      .map(conn => ({
        source: conn.source,
        target: conn.target,
        type: conn.type,
        status: conn.status,
        method: conn.method,
        duration: conn.duration,
        timestamp: conn.timestamp
      }));

    return { nodes, edges };
  }, [agents, connections]);

  // Simple force-directed layout simulation
  useEffect(() => {
    if (!svgRef.current || isLoading || graphData.nodes.length === 0) return;

    const svg = svgRef.current;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());

    // Clear previous content
    svg.innerHTML = '';

    const { nodes, edges } = graphData;

    // Create SVG groups
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(g);

    // Create definitions for gradients and markers
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    g.appendChild(defs);

    // Arrow marker for edges
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrow');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '10');
    marker.setAttribute('refX', '8');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    marker.setAttribute('markerUnits', 'strokeWidth');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M0,0 L0,6 L9,3 z');
    path.setAttribute('fill', '#6b7280');
    marker.appendChild(path);
    defs.appendChild(marker);

    // Simple force simulation (simplified version)
    const simulation = () => {
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Apply forces
      for (let i = 0; i < 50; i++) { // 50 iterations
        // Repulsion between nodes
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const nodeA = nodes[i];
            const nodeB = nodes[j];
            
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            
            if (distance < 100) {
              const force = (100 - distance) * 0.1;
              const fx = (dx / distance) * force;
              const fy = (dy / distance) * force;
              
              nodeA.vx -= fx;
              nodeA.vy -= fy;
              nodeB.vx += fx;
              nodeB.vy += fy;
            }
          }
        }

        // Attraction for connected nodes
        edges.forEach(edge => {
          const source = nodes.find(n => n.id === edge.source);
          const target = nodes.find(n => n.id === edge.target);
          
          if (source && target) {
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            
            const force = (distance - 80) * 0.05;
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;
            
            source.vx += fx;
            source.vy += fy;
            target.vx -= fx;
            target.vy -= fy;
          }
        });

        // Center force
        nodes.forEach(node => {
          const dx = centerX - node.x;
          const dy = centerY - node.y;
          node.vx += dx * 0.01;
          node.vy += dy * 0.01;
        });

        // Apply velocity
        nodes.forEach(node => {
          node.x += node.vx;
          node.y += node.vy;
          
          // Damping
          node.vx *= 0.8;
          node.vy *= 0.8;
          
          // Boundary constraints
          node.x = Math.max(30, Math.min(width - 30, node.x));
          node.y = Math.max(30, Math.min(height - 30, node.y));
        });
      }
    };

    simulation();

    // Draw edges
    const edgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    edgeGroup.setAttribute('class', 'edges');
    g.appendChild(edgeGroup);

    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      
      if (source && target) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', source.x.toString());
        line.setAttribute('y1', source.y.toString());
        line.setAttribute('x2', target.x.toString());
        line.setAttribute('y2', target.y.toString());
        
        // Style based on connection type and status
        let strokeColor = '#6b7280';
        let strokeWidth = '2';
        let strokeDasharray = '';
        
        if (edge.status === 'active') {
          strokeColor = '#10b981';
          strokeWidth = '3';
        } else if (edge.status === 'failed') {
          strokeColor = '#ef4444';
          strokeDasharray = '5,5';
        } else if (edge.type === 'collaboration') {
          strokeColor = '#8b5cf6';
          strokeWidth = '2.5';
        }
        
        line.setAttribute('stroke', strokeColor);
        line.setAttribute('stroke-width', strokeWidth);
        if (strokeDasharray) line.setAttribute('stroke-dasharray', strokeDasharray);
        line.setAttribute('marker-end', 'url(#arrow)');
        
        // Add tooltip
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${source.name} → ${target.name}\n${edge.type}: ${edge.method || 'Unknown'}\nStatus: ${edge.status}`;
        line.appendChild(title);
        
        edgeGroup.appendChild(line);
      }
    });

    // Draw nodes
    const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodeGroup.setAttribute('class', 'nodes');
    g.appendChild(nodeGroup);

    nodes.forEach(node => {
      const nodeElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      nodeElement.setAttribute('class', 'node');
      nodeElement.setAttribute('transform', `translate(${node.x}, ${node.y})`);
      
      // Node circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', '15');
      
      // Color based on status
      let fillColor = '#6b7280';
      let strokeColor = '#374151';
      
      switch (node.status) {
        case 'active':
          fillColor = '#10b981';
          strokeColor = '#059669';
          break;
        case 'busy':
          fillColor = '#f59e0b';
          strokeColor = '#d97706';
          break;
        case 'idle':
          fillColor = '#3b82f6';
          strokeColor = '#2563eb';
          break;
        case 'offline':
          fillColor = '#6b7280';
          strokeColor = '#374151';
          break;
      }
      
      circle.setAttribute('fill', fillColor);
      circle.setAttribute('stroke', strokeColor);
      circle.setAttribute('stroke-width', '2');
      nodeElement.appendChild(circle);
      
      // Activity indicator (pulse for active agents)
      if (node.status === 'active' || node.status === 'busy') {
        const pulseCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pulseCircle.setAttribute('r', '15');
        pulseCircle.setAttribute('fill', 'none');
        pulseCircle.setAttribute('stroke', fillColor);
        pulseCircle.setAttribute('stroke-width', '2');
        pulseCircle.setAttribute('opacity', '0.6');
        
        const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animate.setAttribute('attributeName', 'r');
        animate.setAttribute('values', '15;25;15');
        animate.setAttribute('dur', '2s');
        animate.setAttribute('repeatCount', 'indefinite');
        pulseCircle.appendChild(animate);
        
        const animateOpacity = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animateOpacity.setAttribute('attributeName', 'opacity');
        animateOpacity.setAttribute('values', '0.6;0;0.6');
        animateOpacity.setAttribute('dur', '2s');
        animateOpacity.setAttribute('repeatCount', 'indefinite');
        pulseCircle.appendChild(animateOpacity);
        
        nodeElement.appendChild(pulseCircle);
      }
      
      // Node label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dy', '25');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-weight', '500');
      text.setAttribute('fill', '#374151');
      text.textContent = node.name.length > 15 ? node.name.substring(0, 12) + '...' : node.name;
      nodeElement.appendChild(text);
      
      // Add tooltip
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${node.name}\nType: ${node.type}\nStatus: ${node.status}\nConnections: ${node.connections}\nMessages: ${node.messagesHandled}\nResponse Time: ${node.responseTime}s\nCapabilities: ${node.capabilities.join(', ')}`;
      nodeElement.appendChild(title);
      
      nodeGroup.appendChild(nodeElement);
    });

  }, [graphData, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading network...</p>
        </div>
      </div>
    );
  }

  if (graphData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No agents found</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg 
        ref={svgRef}
        className="w-full h-full"
        style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
      />
      
      {/* Legend */}
      <div className="absolute top-2 right-2 bg-white rounded-lg shadow-sm border border-gray-200 p-3 text-xs">
        <div className="font-medium text-gray-700 mb-2">Status</div>
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-gray-600">Active</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span className="text-gray-600">Busy</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-gray-600">Idle</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
            <span className="text-gray-600">Offline</span>
          </div>
        </div>
        
        <div className="font-medium text-gray-700 mb-2 mt-3">Connections</div>
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-green-500 mr-2"></div>
            <span className="text-gray-600">Active</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-purple-500 mr-2"></div>
            <span className="text-gray-600">Collaboration</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-red-500 mr-2" style={{borderTop: '2px dashed'}}></div>
            <span className="text-gray-600">Failed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkGraph;