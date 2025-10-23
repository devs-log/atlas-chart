import { test, expect } from '@playwright/test';

test.describe('Connection Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5173');
    
    // Wait for the application to load
    await page.waitForSelector('.react-flow');
    
    // Switch to editor mode if not already there
    const editorButton = page.locator('text=Editor').first();
    if (await editorButton.isVisible()) {
      await editorButton.click();
    }
  });

  test('should be able to create connections between nodes', async ({ page }) => {
    // Wait for nodes to be rendered
    await page.waitForSelector('[data-handleid="source-top"]', { timeout: 10000 });
    
    // Check that handles are visible
    const sourceHandles = page.locator('[data-handleid^="source-"]');
    const targetHandles = page.locator('[data-handleid^="target-"]');
    
    await expect(sourceHandles.first()).toBeVisible();
    await expect(targetHandles.first()).toBeVisible();
    
    // Get the first source handle and first target handle
    const firstSourceHandle = sourceHandles.first();
    const firstTargetHandle = targetHandles.first();
    
    // Check if they're on different nodes
    const sourceNode = firstSourceHandle.locator('xpath=ancestor::*[contains(@class, "react-flow__node")]');
    const targetNode = firstTargetHandle.locator('xpath=ancestor::*[contains(@class, "react-flow__node")]');
    
    // Only proceed if we have at least 2 different nodes
    const sourceNodeId = await sourceNode.getAttribute('data-id');
    const targetNodeId = await targetNode.getAttribute('data-id');
    
    if (sourceNodeId === targetNodeId) {
      test.skip('Need at least 2 different nodes to test connections');
    }
    
    // Listen for console logs to verify connection creation
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('onConnect triggered') || msg.text().includes('Connection created')) {
        consoleLogs.push(msg.text());
      }
    });
    
    // Drag from source handle to target handle
    await firstSourceHandle.dragTo(firstTargetHandle);
    
    // Wait a moment for the connection to be processed
    await page.waitForTimeout(1000);
    
    // Check that a connection was created (look for edge elements)
    const edges = page.locator('.react-flow__edge');
    await expect(edges).toHaveCount({ min: 1 });
    
    // Verify console logs show connection was created
    expect(consoleLogs.some(log => log.includes('onConnect triggered'))).toBeTruthy();
    expect(consoleLogs.some(log => log.includes('Connection created'))).toBeTruthy();
  });

  test('should show connection handles on nodes', async ({ page }) => {
    // Wait for nodes to be rendered
    await page.waitForSelector('.react-flow__node', { timeout: 10000 });
    
    // Check that we have nodes
    const nodes = page.locator('.react-flow__node');
    await expect(nodes).toHaveCount({ min: 1 });
    
    // Check that each node has both source and target handles
    const nodeCount = await nodes.count();
    
    for (let i = 0; i < Math.min(nodeCount, 3); i++) {
      const node = nodes.nth(i);
      
      // Hover over the node to make handles visible
      await node.hover();
      
      // Check for source handles
      const sourceHandles = node.locator('[data-handleid^="source-"]');
      await expect(sourceHandles).toHaveCount(4); // top, right, bottom, left
      
      // Check for target handles
      const targetHandles = node.locator('[data-handleid^="target-"]');
      await expect(targetHandles).toHaveCount(4); // top, right, bottom, left
      
      // Verify handle colors
      const blueHandles = node.locator('.bg-blue-500');
      const greenHandles = node.locator('.bg-green-500');
      
      await expect(blueHandles).toHaveCount({ min: 4 }); // source handles should be blue
      await expect(greenHandles).toHaveCount({ min: 4 }); // target handles should be green
    }
  });

  test('should validate connection parameters', async ({ page }) => {
    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Try to create a self-connection (should be prevented)
    await page.waitForSelector('[data-handleid="source-top"]', { timeout: 10000 });
    
    const firstNode = page.locator('.react-flow__node').first();
    const sourceHandle = firstNode.locator('[data-handleid="source-top"]');
    const targetHandle = firstNode.locator('[data-handleid="target-top"]');
    
    // Attempt self-connection
    await sourceHandle.dragTo(targetHandle);
    await page.waitForTimeout(500);
    
    // Should see error in console about self-connection
    expect(consoleErrors.some(error => error.includes('cannot connect node to itself'))).toBeTruthy();
  });
});






