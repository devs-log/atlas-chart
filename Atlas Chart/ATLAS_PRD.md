# 🗺️ **Atlas — Architecture Explorer & Project Management Platform**

*(Merged PRD – Architecture Explorer + Architecture-Led PM + Kanban)*

---

## 🎯 Product Overview

**Atlas** is a modern, canvas-first architecture visualization and project-management platform inspired by Visio, Lucidchart, and Azure Boards.
It unites **architecture**, **execution**, and **workflow** into one interactive map — where every system is a landmark, every connection a dependency, and every task a story.

---

### Vision Statement

> "Make system architecture and delivery as intuitive as browsing a map — where every system is a landmark, every connection a road, every project a journey."

---

## 📋 Core Requirements

*(Phases 1 – 5 summary — fully implemented and validated)*

Features include:

* Infinite Canvas with React Flow
* Fullscreen & Responsive scaling (ultrawide → laptop)
* Focus-centric Radial & Flow layouts
* Editing Mode (CRUD shapes + connectors + frames)
* Advanced Search / Command Palette
* Forbion-inspired design system
* Import / Export + Validation + Undo / Redo
* Accessibility, Keyboard Shortcuts, Color Schemes
* Unit & Integration Testing with Vitest
* Performance: 150 nodes / 300 edges @ 60 FPS

*(See previous sections for detailed implementation tree.)*

---

# 🚀 **Phase 6 — Architecture-Led Project Management (ALPM)**

*(Adds initiatives + work-item management to the architecture layer.)*

---

### 1️⃣ Goal

Transform Atlas into a **living delivery map**.
Every system shows real build progress; every connection shows true dependency health.

Users can:

* View **Initiatives** (projects) across systems
* Track **WorkItems** (tasks) with progress rings
* Drill into nodes → tasks → blockers → owners
* Switch between **Architecture / Project / Work** modes
* Export / persist all data locally or via API

---

### 2️⃣ Functional Overview

| Mode             | Purpose             | Primary UI                        |
| ---------------- | ------------------- | --------------------------------- |
| **Architecture** | Baseline system map | `GraphView.tsx`                   |
| **Project**      | Initiative overlays | `Viewer.tsx` + `ProjectPanel.tsx` |
| **Work**         | Node-level tasks    | `WorkPanel.tsx`                   |

Toolbar toggle state: `viewMode = "architecture" | "project" | "work"` (persist via Zustand + URL).

---

### 3️⃣ Data Model Extensions

```ts
export interface Initiative {
  id:string; name:string;
  description?:string; owner?:string;
  systems:string[]; edges?:string[];
  startDate?:string; targetDate?:string;
  status:"planned"|"in progress"|"delayed"|"done";
  progress?:number; color?:string;
  milestones?:Milestone[];
}
export interface Milestone {
  id:string; name:string; date:string;
  description?:string; completed?:boolean;
}
export interface WorkItem {
  id:string; title:string; description?:string;
  systemId:string; assignee?:string;
  status:"todo"|"in progress"|"review"|"done"|"blocked";
  blockers?:string[]; dueDate?:string;
  externalRef?:{type:"jira"|"devops"|"linear"|"other";id:string;url?:string};
  tags?:string[]; progress?:number;
}
export interface System {
  ...;
  activeInitiatives?:string[];
  workSummary?:{total:number;done:number;inProgress:number;blocked:number};
}
```

---

### 4️⃣ State Management

Extend `useAtlasStore.ts` with:

```ts
viewMode:"architecture"|"project"|"work"|"kanban";
initiatives:Initiative[]; workItems:WorkItem[];
selectedInitiativeId?:string; selectedWorkItemId?:string;
setViewMode(...); setInitiatives(...); setWorkItems(...);
selectInitiative(...); selectWorkItem(...);
```

Persist via localStorage.

---

### 5️⃣ New Components

| Component                        | Function                   |
| -------------------------------- | -------------------------- |
| `ProjectPanel.tsx`               | Sidebar of initiatives     |
| `WorkPanel.tsx`                  | Drawer of tasks per system |
| `ProgressRing.tsx`               | SVG ring overlay           |
| `InitiativeBadge.tsx`            | Node chip                  |
| `TimelineView.tsx`               | Gantt timeline             |
| *(added later)* `KanbanView.tsx` | Drag-drop board            |

---

### 6️⃣ UI & UX Highlights

* Toolbar toggle: Architecture • Project • Work • Kanban
* `ProjectPanel`: 300 px floating sidebar → owner, dates, progress
* `WorkPanel`: 400 px drawer → tabs Tasks / Timeline / Deps / People
* `ProgressRing`: inline SVG stroke by status color
* Initiative overlay: tinted nodes + bold edges + tooltip progress

---

### 7️⃣ Logic / Behaviors

* `initiative.progress = done / total`
* Auto-recalc on WorkItem change
* Blocked → dependent edges pulse red

---

### 8️⃣ Import / Export

`.atlaspm.json` format: `{systems, initiatives, workItems}`
Backward compatible with `.atlas.json`.

---

### 9️⃣ Testing

`projectStore.test.ts`, `projectRendering.test.tsx`, `taskEditing.test.tsx`
Use Vitest + jsdom.

---

### 10️⃣ Performance

≤ 50 ms per node render, 250 nodes / 500 work items smooth 60 FPS.

---

### 11️⃣ Design Tokens

```css
--initiative-bg:rgba(18,50,91,0.12);
--initiative-ring:#1b5fbf;
--progress-done:#1f7a4d;
--progress-blocked:#b91c1c;
```

Borderless glass panels, 200–260 ms ease-in motions.

---

### 12️⃣ Definition of Done

✅ Modes functional ✅ Data persisted ✅ Overlays dynamic ✅ Tests pass

---

# 🧭 **Phase 6.5 — Kanban View ("Atlas Boards")**

---

## 🎯 Purpose

Add a **Kanban-style board** for managing WorkItems visually.
It provides a drag-and-drop interface like Azure Boards or Jira, fully synced with Atlas architecture data.

---

## 🧱 Core Objectives

1. View and move tasks between status columns.
2. Filter by initiative, system, assignee, tag.
3. Maintain bi-directional sync with architecture and project views.
4. Support 500 + cards smoothly.
5. Fit the Forbion minimal aesthetic.

---

## 🧠 Navigation

Toolbar adds `Kanban` mode → `viewMode:"kanban"`.
Accessible from:

* System WorkPanel ("Open in Kanban")
* Initiative sidebar ("View Tasks")

---

## ⚙️ Functional Spec

### Columns → Status Mapping

| Status      | Label       | Color  |
| ----------- | ----------- | ------ |
| todo        | To Do       | gray   |
| in progress | In Progress | blue   |
| review      | In Review   | purple |
| blocked     | Blocked     | red    |
| done        | Done        | green  |

### Cards

* Title, System badge, Initiative badge
* Assignee avatar + tags
* Progress ring (optional)
* Click → open `WorkPanel`
* Drag/drop → update `status`

### Filters / Sort

Top bar:

* Search ( Fuse.js )
* Initiative / System / Assignee / Tag / Only Blockers
* Sort by last updated or due date

---

## 🎨 Design

* Full-width canvas, horizontal scroll
* Sticky column headers
* Light column backgrounds + colored top border
* Smooth drag animations (200 ms)
* Palette:

```css
--kanban-bg:#f9fafb;
--kanban-column-border:#E7EBF0;
--kanban-card-bg:#ffffff;
--kanban-card-hover:#f3f6fa;
```

---

## 🧩 Component Architecture

| Component               | Purpose                    |
| ----------------------- | -------------------------- |
| `KanbanView.tsx`        | Main wrapper / mode switch |
| `KanbanColumn.tsx`      | One status lane            |
| `KanbanCard.tsx`        | Individual WorkItem        |
| `KanbanToolbar.tsx`     | Filters & search           |
| `KanbanBoardContext.ts` | DnD state + helpers        |

---

## 🔀 Drag & Drop

Use `@dnd-kit/core` (or `react-beautiful-dnd`).

* Auto-scroll on edge
* Glow feedback on drop
* On drop → update `status`, persist store, recalc progress

---

## 🔗 Integration

* `WorkPanel` opens on card click
* Live sync with `workItems` in store
* Updates cascade to systems & initiatives

---

## 🧮 Performance

* 500 cards, 5 columns @ 60 FPS
* Drag latency < 30 ms
* Virtual scroll for tall columns

---

## 🧪 Testing

* `kanbanDrag.test.tsx` – drag/drop behavior
* `kanbanFilter.test.tsx` – filters accuracy
* `kanbanPerf.test.ts` – large-board FPS

---

## 🔐 Permissions

| Role        | Rights         |
| ----------- | -------------- |
| Viewer      | Read-only      |
| Contributor | CRUD WorkItems |
| Architect   | Link systems   |
| Admin       | Full control   |

---

## ✅ Definition of Done

✅ Kanban mode renders all tasks
✅ Drag/drop updates store and UI live
✅ Filters persist across sessions
✅ Cards show system + initiative context
✅ Performance targets met

---

## 🔮 Future Enhancements

* Swimlanes by system/initiative
* Timeline overlay beneath columns
* Native Jira/Azure DevOps sync
* Analytics layer (cycle time, throughput, blockers)

---

## ✨ Summary

**Atlas Boards** completes the Architecture-Led PM vision.
The architecture map shows *where* things live,
the project overlays show *what's changing*,
and the Kanban shows *how work flows*.

Together they form a single, intuitive system where **architecture, delivery, and management converge** — a living map of real-world progress.

---

✅ **End of PRD – Atlas Full Specification (Phases 1–6.5)**

---

**Next instruction for Cursor:**

> "Use the `ATLAS-PRD-FULL.md` file as your authoritative build context.
> Implement Phase 6 (ALPM) and Phase 6.5 (Kanban) atop the existing Atlas React + TypeScript app.
> Maintain all design, performance, and behavioral requirements until completion. DO NOT USE WORKAROUNDS OR NON-BEST PRACTICE METHODS"