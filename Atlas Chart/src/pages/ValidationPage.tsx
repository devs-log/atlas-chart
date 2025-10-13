import React, { useState, useEffect } from 'react';
import { useAtlasStore } from '@/store/useAtlasStore';

export default function ValidationPage() {
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const { systems, edges, getReactFlowNodes, getReactFlowEdges } = useAtlasStore();

  const runValidation = async () => {
    setIsRunning(true);
    const results: any[] = [];

    // Test 1: Check if systems are loaded
    results.push({
      test: 'Systems Loaded',
      status: systems.length > 0 ? 'PASS' : 'FAIL',
      details: `Found ${systems.length} systems`,
      timestamp: new Date().toISOString()
    });

    // Test 2: Check if React Flow nodes are generated
    const reactFlowNodes = getReactFlowNodes();
    results.push({
      test: 'React Flow Nodes Generated',
      status: reactFlowNodes.length > 0 ? 'PASS' : 'FAIL',
      details: `Generated ${reactFlowNodes.length} React Flow nodes`,
      timestamp: new Date().toISOString()
    });

    // Test 3: Check if edges exist
    results.push({
      test: 'Edges Present',
      status: edges.length > 0 ? 'PASS' : 'FAIL',
      details: `Found ${edges.length} edges`,
      timestamp: new Date().toISOString()
    });

    // Test 4: Check if React Flow edges are generated
    const reactFlowEdges = getReactFlowEdges();
    results.push({
      test: 'React Flow Edges Generated',
      status: reactFlowEdges.length > 0 ? 'PASS' : 'FAIL',
      details: `Generated ${reactFlowEdges.length} React Flow edges`,
      timestamp: new Date().toISOString()
    });

    // Test 5: Check edge handle information
    const edgesWithHandles = edges.filter(edge => edge.sourceHandle || edge.targetHandle);
    results.push({
      test: 'Edge Handle Information',
      status: edgesWithHandles.length > 0 ? 'PASS' : 'FAIL',
      details: `${edgesWithHandles.length}/${edges.length} edges have handle information`,
      timestamp: new Date().toISOString()
    });

    // Test 6: Check for specific edge properties
    const sampleEdge = edges[0];
    if (sampleEdge) {
      const hasRequiredFields = sampleEdge.id && sampleEdge.source && sampleEdge.target;
      results.push({
        test: 'Edge Structure',
        status: hasRequiredFields ? 'PASS' : 'FAIL',
        details: `Sample edge: ${JSON.stringify(sampleEdge)}`,
        timestamp: new Date().toISOString()
      });
    }

    // Test 7: Check React Flow edge structure
    const sampleReactFlowEdge = reactFlowEdges[0];
    if (sampleReactFlowEdge) {
      const hasHandleInfo = sampleReactFlowEdge.sourceHandle || sampleReactFlowEdge.targetHandle;
      results.push({
        test: 'React Flow Edge Handles',
        status: hasHandleInfo ? 'PASS' : 'FAIL',
        details: `Sample RF edge: ${JSON.stringify(sampleReactFlowEdge)}`,
        timestamp: new Date().toISOString()
      });
    }

    setValidationResults(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runValidation();
  }, [systems, edges]);

  const passCount = validationResults.filter(r => r.status === 'PASS').length;
  const totalCount = validationResults.length;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Atlas Chart Validation</h1>
      
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={runValidation}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isRunning ? 'Running...' : 'Run Validation'}
          </button>
          
          <div className="text-lg">
            Results: {passCount}/{totalCount} tests passed
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {validationResults.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              result.status === 'PASS'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{result.test}</span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  result.status === 'PASS'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {result.status}
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-1">{result.details}</div>
            <div className="text-xs text-gray-400">{result.timestamp}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Manual Testing Instructions:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Switch to Editor mode</li>
          <li>Look for blue and green handles on nodes</li>
          <li>Try dragging from a blue handle to a green handle on a different node</li>
          <li>Check browser console for connection logs</li>
          <li>Verify that a new connection line appears</li>
        </ol>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Browser Console Commands:</h3>
        <div className="text-sm font-mono bg-white p-2 rounded border">
          <div>// Copy and paste this into browser console:</div>
          <div>fetch('/scripts/validate-connections.js').then(r =&gt; r.text()).then(eval);</div>
        </div>
      </div>
    </div>
  );
}
