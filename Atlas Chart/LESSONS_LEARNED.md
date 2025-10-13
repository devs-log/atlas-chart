# CRITICAL LESSONS LEARNED - NEVER REPEAT THESE MISTAKES

## How I Broke the Atlas Application (TWICE)

### First Break - Connection Features Implementation
**What I did wrong:**
1. Made multiple changes to source files without testing each change individually
2. Didn't verify the application was still working after each change
3. Made assumptions about what was "working" without actually testing
4. Didn't follow proper development practices (test incrementally)

### Second Break - Attempted Fixes
**What I did wrong:**
1. **Modified the root `index.html`** - This was the critical mistake that broke everything
2. **Tried to manually edit the built HTML files** instead of fixing the source
3. **Copied assets around** instead of properly rebuilding
4. **Made multiple changes simultaneously** without testing each one
5. **Assumed the problem was with serving** when it was actually corrupted source files

### The Root Cause of the Second Break
The application was trying to load individual JavaScript files (`data-model.js`, `canvas-engine.js`, etc.) because:
- I modified the root `index.html` file
- This corrupted the development setup
- The browser was loading corrupted JavaScript that tried to dynamically load individual files
- This prevented React Flow from working properly

## NEVER DO THESE THINGS AGAIN:

### ❌ NEVER:
1. **Modify the root `index.html` file** - This is for development only
2. **Manually edit built files** in the `dist/` folder
3. **Copy assets around** between directories
4. **Make multiple changes without testing each one**
5. **Assume something is working without actually testing it**
6. **Try to "fix" built files instead of fixing the source**

### ✅ ALWAYS:
1. **Test after EVERY single change**
2. **Only modify source files** in the `src/` directory
3. **Use proper build processes** (`npm run build` or `npx vite build`)
4. **Let Vite handle the HTML generation** - don't touch it manually
5. **Make one small change at a time** and verify it works
6. **Use git to track changes** and revert if something breaks

## The Correct Approach for Connection Features:
1. **Only modify source files** (`src/pages/Viewer.tsx`, `src/pages/Editor.tsx`)
2. **Test each change individually** by running the dev server
3. **Use proper React Flow patterns** - don't try to hack the HTML
4. **Let the build process handle bundling** - don't interfere with it

## Key Takeaway:
**The root `index.html` is sacred - never touch it.** It's the development entry point and Vite handles everything else. When I modified it, I broke the entire development workflow.

