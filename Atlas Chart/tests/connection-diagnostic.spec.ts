import { test, expect } from '@playwright/test';

test.describe('Connection Diagnostic Tests', () => {
  test('should diagnose connection issues', async ({ page }) => {
    // Collect console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Navigate to the editor
    await page.goto('http://localhost:5173');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Wait for React Flow to be ready
    await page.waitForSelector('.react-flow__node', { timeout: 10000 });
    
    // Log all console messages so far
    console.log('=== Initial Console Messages ===');
    consoleMessages.forEach(msg => console.log(msg));
    
    // Check for debug nodes
    const debugNodes = await page.locator('[data-id*="debug"]').count();
    console.log(`Found ${debugNodes} debug nodes`);
    
    // Look for handles with required attributes
    const handles = await page.locator('.react-flow__handle').all();
    console.log(`Found ${handles.length} handles`);
    
    for (let i = 0; i < Math.min(handles.length, 4); i++) {
      const handle = handles[i];
      const classes = await handle.getAttribute('class');
      const nodeId = await handle.getAttribute('data-nodeid');
      const handleId = await handle.getAttribute('data-handleid');
      const handlePos = await handle.getAttribute('data-handlepos');
      
      console.log(`Handle ${i + 1}:`);
      console.log(`  Classes: ${classes}`);
      console.log(`  NodeId: ${nodeId}`);
      console.log(`  HandleId: ${handleId}`);
      console.log(`  HandlePos: ${handlePos}`);
    }
    
    // Try to select the connect tool
    const connectTool = page.locator('button[title*="Connect"], button:has-text("Connect")').first();
    if (await connectTool.isVisible()) {
      await connectTool.click();
      console.log('Clicked connect tool');
    } else {
      console.log('Connect tool not found - trying alternative selector');
      // Try to find any button with connect-related text
      const altConnectTool = page.locator('button').filter({ hasText: /connect/i }).first();
      if (await altConnectTool.isVisible()) {
        await altConnectTool.click();
        console.log('Clicked alternative connect tool');
      }
    }
    
    // Wait a moment for tool selection
    await page.waitForTimeout(500);
    
    // Try to drag from first handle to second handle
    console.log('Attempting connection drag...');
    
    // Find handles that are visible
    const visibleHandles = await page.locator('.react-flow__handle:visible').all();
    console.log(`Found ${visibleHandles.length} visible handles`);
    
    if (visibleHandles.length >= 2) {
      const sourceHandle = visibleHandles[0];
      const targetHandle = visibleHandles[1];
      
      // Get positions
      const sourceBox = await sourceHandle.boundingBox();
      const targetBox = await targetHandle.boundingBox();
      
      if (sourceBox && targetBox) {
        console.log(`Dragging from (${sourceBox.x + sourceBox.width/2}, ${sourceBox.y + sourceBox.height/2}) to (${targetBox.x + targetBox.width/2}, ${targetBox.y + targetBox.height/2})`);
        
        // Perform the drag
        await page.mouse.move(sourceBox.x + sourceBox.width/2, sourceBox.y + sourceBox.height/2);
        await page.mouse.down();
        await page.waitForTimeout(100);
        await page.mouse.move(targetBox.x + targetBox.width/2, targetBox.y + targetBox.height/2);
        await page.waitForTimeout(100);
        await page.mouse.up();
        
        console.log('Drag operation completed');
        
        // Wait for any async operations
        await page.waitForTimeout(1000);
      }
    }
    
    // Check for any new console messages
    console.log('=== Console Messages After Drag ===');
    consoleMessages.slice(-10).forEach(msg => console.log(msg)); // Last 10 messages
    
    // Check if any connections were created
    const edges = await page.locator('.react-flow__edge').count();
    console.log(`Found ${edges} edges after drag attempt`);
    
    // Check if connection line is visible during drag
    const connectionLine = await page.locator('.react-flow__connection-line').isVisible();
    console.log(`Connection line visible: ${connectionLine}`);
    
    // Take a screenshot for visual debugging
    await page.screenshot({ path: 'test-results/connection-diagnostic.png', fullPage: true });
    
    // Log all console messages for analysis
    console.log('=== ALL CONSOLE MESSAGES ===');
    consoleMessages.forEach((msg, index) => {
      console.log(`${index + 1}: ${msg}`);
    });
  });
  
  test('should check handle DOM structure', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.react-flow__handle', { timeout: 10000 });
    
    // Get the HTML of the first handle
    const firstHandle = page.locator('.react-flow__handle').first();
    const handleHTML = await firstHandle.innerHTML();
    const handleOuterHTML = await firstHandle.evaluate(el => el.outerHTML);
    
    console.log('=== FIRST HANDLE HTML ===');
    console.log(handleOuterHTML);
    
    // Check specific attributes
    const attributes = await firstHandle.evaluate(el => ({
      className: el.className,
      nodeId: el.getAttribute('data-nodeid'),
      handleId: el.getAttribute('data-handleid'),
      handlePos: el.getAttribute('data-handlepos'),
      type: el.getAttribute('data-handletype'),
      style: el.getAttribute('style')
    }));
    
    console.log('=== HANDLE ATTRIBUTES ===');
    console.log(JSON.stringify(attributes, null, 2));
  });
});





