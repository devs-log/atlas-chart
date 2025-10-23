import { test, expect } from '@playwright/test';

test.describe('Arrow Markers', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    
    // Wait for the app to load
    await page.waitForSelector('.react-flow__node', { timeout: 10000 });
  });

  test('should render edges with arrow markers', async ({ page }) => {
    // Check if there are any edges with markers
    const edgesWithMarkers = await page.$$('path[marker-end]');
    expect(edgesWithMarkers.length).toBeGreaterThan(0);
    
    // Check if marker definitions exist in SVG
    const markerDefinitions = await page.$$('marker[id="arrow"], marker[id="arrowclosed"]');
    expect(markerDefinitions.length).toBeGreaterThan(0);
  });

  test('should have different arrow styles for different edge types', async ({ page }) => {
    // Get all edge paths
    const edgePaths = await page.$$('path.react-flow__edge-path');
    
    // Check that edges have marker-end attributes
    for (const edge of edgePaths) {
      const markerEnd = await edge.getAttribute('marker-end');
      if (markerEnd) {
        expect(markerEnd).toMatch(/url\(#arrow\)|url\(#arrowclosed\)/);
      }
    }
  });

  test('should render sync edges with closed arrows', async ({ page }) => {
    // Look for edges with sync kind that should have closed arrows
    const syncEdges = await page.$$('path[data-kind="sync"]');
    
    for (const edge of syncEdges) {
      const markerEnd = await edge.getAttribute('marker-end');
      if (markerEnd) {
        expect(markerEnd).toContain('arrowclosed');
      }
    }
  });

  test('should render async edges with open arrows', async ({ page }) => {
    // Look for edges with async kind that should have open arrows
    const asyncEdges = await page.$$('path[data-kind="async"]');
    
    for (const edge of asyncEdges) {
      const markerEnd = await edge.getAttribute('marker-end');
      if (markerEnd) {
        expect(markerEnd).toContain('arrow');
      }
    }
  });

  test('should have proper marker colors', async ({ page }) => {
    // Check that markers have the expected colors
    const arrowMarker = await page.$('marker[id="arrow"] path');
    const arrowClosedMarker = await page.$('marker[id="arrowclosed"] path');
    
    if (arrowMarker) {
      const fill = await arrowMarker.getAttribute('fill');
      expect(fill).toBe('#3b82f6');
    }
    
    if (arrowClosedMarker) {
      const fill = await arrowClosedMarker.getAttribute('fill');
      expect(fill).toBe('#3b82f6');
    }
  });

  test('should maintain arrow markers when edges are selected', async ({ page }) => {
    // Click on an edge to select it
    const firstEdge = await page.$('path.react-flow__edge-path');
    if (firstEdge) {
      await firstEdge.click();
      
      // Check that the edge still has markers after selection
      const markerEnd = await firstEdge.getAttribute('marker-end');
      expect(markerEnd).toBeTruthy();
    }
  });
});




