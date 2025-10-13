// Manual validation script for connection functionality
// Run this in the browser console to check connection state

console.log('🔍 Atlas Chart Connection Validator');
console.log('================================');

// Check if React Flow is loaded
if (typeof window.ReactFlow === 'undefined') {
  console.error('❌ React Flow not found');
} else {
  console.log('✅ React Flow is loaded');
}

// Check for nodes
const nodes = document.querySelectorAll('.react-flow__node');
console.log(`📊 Found ${nodes.length} nodes`);

if (nodes.length === 0) {
  console.error('❌ No nodes found - cannot test connections');
} else {
  console.log('✅ Nodes are present');
  
  // Check for handles on first node
  const firstNode = nodes[0];
  const sourceHandles = firstNode.querySelectorAll('[data-handleid^="source-"]');
  const targetHandles = firstNode.querySelectorAll('[data-handleid^="target-"]');
  
  console.log(`🔵 Source handles: ${sourceHandles.length} (expected: 4)`);
  console.log(`🟢 Target handles: ${targetHandles.length} (expected: 4)`);
  
  if (sourceHandles.length === 4 && targetHandles.length === 4) {
    console.log('✅ All handles are present');
  } else {
    console.error('❌ Missing handles');
  }
  
  // Check handle visibility
  const visibleSourceHandles = Array.from(sourceHandles).filter(h => 
    window.getComputedStyle(h).opacity !== '0'
  );
  const visibleTargetHandles = Array.from(targetHandles).filter(h => 
    window.getComputedStyle(h).opacity !== '0'
  );
  
  console.log(`👁️ Visible source handles: ${visibleSourceHandles.length}`);
  console.log(`👁️ Visible target handles: ${visibleTargetHandles.length}`);
}

// Check for edges
const edges = document.querySelectorAll('.react-flow__edge');
console.log(`🔗 Found ${edges.length} existing edges`);

// Check if connection mode is enabled
const reactFlowInstance = document.querySelector('.react-flow');
if (reactFlowInstance) {
  // Try to find React Flow internal state
  const reactFlowWrapper = reactFlowInstance.closest('[data-id]');
  if (reactFlowWrapper) {
    console.log('✅ React Flow wrapper found');
  }
}

// Check console for connection logs
console.log('📝 Checking for connection logs...');
console.log('   - Look for "onConnect triggered" messages');
console.log('   - Look for "Connection created" messages');
console.log('   - Look for any error messages');

// Test connection creation function
window.testConnection = function() {
  console.log('🧪 Testing connection creation...');
  
  if (nodes.length < 2) {
    console.error('❌ Need at least 2 nodes to test connections');
    return;
  }
  
  const sourceNode = nodes[0];
  const targetNode = nodes[1];
  
  const sourceHandle = sourceNode.querySelector('[data-handleid="source-right"]');
  const targetHandle = targetNode.querySelector('[data-handleid="target-left"]');
  
  if (!sourceHandle || !targetHandle) {
    console.error('❌ Could not find handles for testing');
    return;
  }
  
  console.log('🎯 Attempting to create connection...');
  console.log('   Source:', sourceHandle);
  console.log('   Target:', targetHandle);
  
  // Simulate drag and drop
  const sourceRect = sourceHandle.getBoundingClientRect();
  const targetRect = targetHandle.getBoundingClientRect();
  
  console.log('📍 Source position:', sourceRect);
  console.log('📍 Target position:', targetRect);
  
  // Trigger mouse events to simulate drag
  const mouseDownEvent = new MouseEvent('mousedown', {
    clientX: sourceRect.left + sourceRect.width / 2,
    clientY: sourceRect.top + sourceRect.height / 2,
    bubbles: true
  });
  
  sourceHandle.dispatchEvent(mouseDownEvent);
  
  setTimeout(() => {
    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: targetRect.left + targetRect.width / 2,
      clientY: targetRect.top + targetRect.height / 2,
      bubbles: true
    });
    
    document.dispatchEvent(mouseMoveEvent);
    
    setTimeout(() => {
      const mouseUpEvent = new MouseEvent('mouseup', {
        clientX: targetRect.left + targetRect.width / 2,
        clientY: targetRect.top + targetRect.height / 2,
        bubbles: true
      });
      
      document.dispatchEvent(mouseUpEvent);
      
      setTimeout(() => {
        const newEdges = document.querySelectorAll('.react-flow__edge');
        console.log(`🔗 Edges after test: ${newEdges.length}`);
        
        if (newEdges.length > edges.length) {
          console.log('✅ Connection creation successful!');
        } else {
          console.log('❌ No new connection created');
        }
      }, 500);
    }, 100);
  }, 100);
};

console.log('🚀 Run testConnection() to test connection creation');

console.log('================================');
console.log('Validation complete!');


