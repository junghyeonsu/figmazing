# @figmazing/event

only ESM support.

This library provides a type-safe event system for communication between the main and UI contexts in Figma plugins.

## Features

- Complete TypeScript-based type inference
- Automatic inference of event names and payload types
- Convenient API for event registration and emission
- Backwards compatibility with the create-figma-plugin event system

## Installation

```bash
npm install @figmazing/event
```

## Basic Usage

### 1. Using Without Type Definitions

The simplest way to use the library is without type definitions:

```typescript
import { event } from '@figmazing/event';

// Listen for events
event('selection-change').on((payload) => {
  console.log('Selection changed:', payload);
});

// Emit events
event('selection-change').emit({ ids: ['1', '2', '3'] });
```

### 2. Creating a Typed Event System

For type safety, you can define an event map:

```typescript
import { createEventSystem } from '@figmazing/event';

// Define event map
interface MyEvents {
  'selection-change': { ids: string[] };
  'document-update': { timestamp: number };
  'notification': { message: string; type: 'info' | 'warning' | 'error' };
}

// Create a typed event system
const myEvents = createEventSystem<MyEvents>();

// Listen for events in the main context
myEvents('selection-change').on((payload) => {
  // payload is automatically inferred as { ids: string[] }
  console.log(`Selected items: ${payload.ids.length}`);
});

// Emit events from the UI context
myEvents('selection-change').emit({ ids: ['1', '2', '3'] });
```

## Advanced Usage

### One-time Event Handlers

Use the `once` method to register an event handler that will run only once:

```typescript
myEvents('notification').once((payload) => {
  console.log(`Notification (one-time): ${payload.message}`);
});
```

### Unregistering Event Handlers

Call the function returned when registering an event handler to unregister it:

```typescript
const unsubscribe = myEvents('document-update').on((payload) => {
  console.log(`Document updated: ${payload.timestamp}`);
});

// Later, unregister the handler
unsubscribe();
```

### Using the create-figma-plugin Style

For backwards compatibility, the library also supports the original `on`, `once`, and `emit` functions:

```typescript
import { on, once, emit } from '@figmazing/event';

// Listen for events
on('selection-change', (payload) => {
  console.log('Selection changed:', payload);
});

// One-time event listening
once('notification', (payload) => {
  console.log('Notification (one-time):', payload);
});

// Emit events
emit('selection-change', { ids: ['1', '2', '3'] });
```

## Example: Using in a Figma Plugin

### 1. main.ts (Main Context)

```typescript
import { createEventSystem } from '@figmazing/event';

interface PluginEvents {
  'ui:ready': void;
  'ui:close': void;
  'selection:change': { ids: string[] };
  'create:rectangle': { width: number; height: number; color: string };
}

const pluginEvents = createEventSystem<PluginEvents>();

// Send current selection information when UI is ready
pluginEvents('ui:ready').on(() => {
  const nodes = figma.currentPage.selection;
  const ids = nodes.map(node => node.id);
  pluginEvents('selection:change').emit({ ids });
});

// Handle rectangle creation request
pluginEvents('create:rectangle').on(({ width, height, color }) => {
  const rect = figma.createRectangle();
  rect.resize(width, height);
  
  const [r, g, b] = hexToRgb(color);
  rect.fills = [{ type: 'SOLID', color: { r, g, b } }];
  
  figma.currentPage.appendChild(rect);
});

// Handle UI close request
pluginEvents('ui:close').on(() => {
  figma.closePlugin();
});

// Show UI
figma.showUI(__html__, { width: 300, height: 400 });
```

### 2. ui.tsx (UI Context)

```tsx
import * as React from 'react';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createEventSystem } from '@figmazing/event';

interface PluginEvents {
  'ui:ready': void;
  'ui:close': void;
  'selection:change': { ids: string[] };
  'create:rectangle': { width: number; height: number; color: string };
}

const pluginEvents = createEventSystem<PluginEvents>();

function App() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rectWidth, setRectWidth] = useState(100);
  const [rectHeight, setRectHeight] = useState(100);
  const [rectColor, setRectColor] = useState('#FF0000');
  
  useEffect(() => {
    // Notify main context that UI is ready
    pluginEvents('ui:ready').emit();
    
    // Listen for selection change events
    return pluginEvents('selection:change').on(({ ids }) => {
      setSelectedIds(ids);
    });
  }, []);
  
  const handleCreateRect = () => {
    pluginEvents('create:rectangle').emit({
      width: rectWidth,
      height: rectHeight,
      color: rectColor
    });
  };
  
  const handleClose = () => {
    pluginEvents('ui:close').emit();
  };
  
  return (
    <div className="container">
      <h2>Create Rectangle</h2>
      <div className="form-group">
        <label>Width</label>
        <input 
          type="number" 
          value={rectWidth} 
          onChange={(e) => setRectWidth(Number(e.target.value))} 
        />
      </div>
      <div className="form-group">
        <label>Height</label>
        <input 
          type="number" 
          value={rectHeight} 
          onChange={(e) => setRectHeight(Number(e.target.value))} 
        />
      </div>
      <div className="form-group">
        <label>Color</label>
        <input 
          type="color" 
          value={rectColor} 
          onChange={(e) => setRectColor(e.target.value)} 
        />
      </div>
      <button onClick={handleCreateRect}>Create Rectangle</button>
      <button onClick={handleClose}>Close</button>
      
      <div className="selection-info">
        <h3>Selected Items</h3>
        {selectedIds.length > 0 ? (
          <ul>
            {selectedIds.map(id => <li key={id}>{id}</li>)}
          </ul>
        ) : (
          <p>No items selected.</p>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById('app')).render(<App />);
```

## Notes

- A warning is displayed when an event is emitted without any registered handlers.
- This library only supports communication between the main and UI contexts in Figma plugins.
- It does not work in Node.js environments.

## Differences from create-figma-plugin

- Event names and payload types can be managed together.
- Safer code writing through type inference.
- More convenient API through method chaining.
- Improved error handling.
