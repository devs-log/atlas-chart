// Quick validation test script
// Run this in the browser console to quickly test connection functionality

console.log('🚀 Quick Atlas Chart Connection Test');
console.log('====================================');

// Test 1: Check if the app is loaded
const app = document.querySelector('.app-shell');
if (!app) {
  console.error('❌ App not found - make sure the page is loaded');
} else {
  console.log('✅ App shell found');
}

// Test 2: Check for React Flow
const reactFlow = document.querySelector('.react-flow');
if (!reactFlow) {
  console.error('❌ React Flow not found');
} else {
  console.log('✅ React Flow found');
}

// Test 3: Check for nodes
const nodes = document.querySelectorAll('.react-flow__node');
console.log(`📊 Found ${nodes.length} nodes`);

if (nodes.length === 0) {
  console.error('❌ No nodes found');
} else {
  console.log('✅ Nodes are present');
  
  // Test 4: Check for handles
  const firstNode = nodes[0];
  const sourceHandles = firstNode.querySelectorAll('[data-handleid^="source-"]');
  const targetHandles = firstNode.querySelectorAll('[data-handleid^="target-"]');
  
  console.log(`🔵 Source handles: ${sourceHandles.length}`);
  console.log(`🟢 Target handles: ${targetHandles.length}`);
  
  if (sourceHandles.length === 4 && targetHandles.length === 4) {
    console.log('✅ All handles present');
  } else {
    console.error('❌ Missing handles');
  }
}

// Test 5: Check for edges
const edges = document.querySelectorAll('.react-flow__edge');
console.log(`🔗 Found ${edges.length} edges`);

// Test 6: Check if in editor mode
const editButton = document.querySelector('button[class*="bg-white"][class*="text-primary"]');
if (editButton && editButton.textContent.includes('Edit')) {
  console.log('✅ In editor mode - connections should be enabled');
} else {
  console.log('⚠️ Not in editor mode - switch to Edit mode to test connections');
}

// Test 7: Check console for errors
console.log('📝 Check the console above for any error messages');

// Test 8: Manual connection test
if (nodes.length >= 2) {
  console.log('🧪 Manual test available:');
  console.log('1. Look for blue and green handles on nodes');
  console.log('2. Drag from a blue handle to a green handle on a different node');
  console.log('3. Watch for connection creation logs in console');
  console.log('4. Verify a new connection line appears');
} else {
  console.log('❌ Need at least 2 nodes to test connections');
}

console.log('====================================');
console.log('Test complete! Check results above.');


