// Browser Console Test Script for Connection Diagnostics
// Run this in the browser console on http://localhost:5173

console.log('=== CONNECTION DIAGNOSTIC TEST ===');

// 1. Check initial selectedTool
const selectedTool = document.querySelector('[data-testid="selected-tool"]')?.textContent || 'unknown';
console.log('Initial selectedTool:', selectedTool);

// 2. Check for React Flow context
console.log('React Flow instance:', window.reactFlowInstance ? 'FOUND' : 'MISSING');

// 3. Count handles and check their attributes
const handles = document.querySelectorAll('.react-flow__handle');
console.log(`Found ${handles.length} handles`);

handles.forEach((handle, index) => {
  if (index < 4) { // Only check first 4
    const classes = handle.className;
    const nodeId = handle.getAttribute('data-nodeid');
    const handleId = handle.getAttribute('data-handleid');
    const handlePos = handle.getAttribute('data-handlepos');
    
    console.log(`Handle ${index + 1}:`);
    console.log(`  Classes: ${classes}`);
    console.log(`  NodeId: ${nodeId}`);
    console.log(`  HandleId: ${handleId}`);
    console.log(`  HandlePos: ${handlePos}`);
    console.log(`  Outer HTML: ${handle.outerHTML}`);
  }
});

// 4. Check for debug nodes
const debugNodes = document.querySelectorAll('[data-id*="debug"]');
console.log(`Found ${debugNodes.length} debug nodes`);

// 5. Check for connect tool
const connectTool = document.querySelector('button[title*="Connect"], button:has-text("Connect")');
console.log('Connect tool found:', connectTool ? 'YES' : 'NO');

// 6. Try to click connect tool
if (connectTool) {
  console.log('Clicking connect tool...');
  connectTool.click();
  setTimeout(() => {
    console.log('Connect tool clicked');
  }, 100);
}

// 7. Check for nodes
const nodes = document.querySelectorAll('.react-flow__node');
console.log(`Found ${nodes.length} total nodes`);

// 8. Check for edges
const edges = document.querySelectorAll('.react-flow__edge');
console.log(`Found ${edges.length} edges`);

console.log('=== DIAGNOSTIC COMPLETE ===');





