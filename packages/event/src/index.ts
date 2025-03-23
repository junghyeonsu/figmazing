/**
 * Event Type System - A library for communication between main and UI layers in Figma plugins
 * 
 * @example
 * // Basic usage
 * import { event } from '@figmazing/event';
 * 
 * // Listen for events
 * event('selection-change').on((payload) => {
 *   console.log('Selection changed:', payload);
 * });
 * 
 * // Emit events
 * event('selection-change').emit({ ids: ['1', '2', '3'] });
 * 
 * @example
 * // Usage with type definitions
 * import { createEventSystem } from '@figmazing/event';
 * 
 * // Define event map
 * interface MyEvents {
 *   'selection-change': { ids: string[] };
 *   'document-update': { timestamp: number };
 * }
 * 
 * // Create typed event system
 * const myEvents = createEventSystem<MyEvents>();
 * 
 * // Listen for events (payload type is automatically inferred)
 * myEvents('selection-change').on((payload) => {
 *   console.log(`Selected items: ${payload.ids.length}`);
 * });
 * 
 * // Emit events (with payload type checking)
 * myEvents('selection-change').emit({ ids: ['1', '2', '3'] });
 */

// Interface for event map type definition
export interface EventMap {
  [key: string]: any;
}

// Event name type (all registered event names)
export type EventName<T extends EventMap = EventMap> = keyof T & string;

// Event handler type
export type EventHandler<T = any> = (payload: T) => void;

// Internal storage for event registration management
interface EventHandlerEntry {
  name: string;
  handler: EventHandler<any>;
}

const eventHandlers: Record<string, EventHandlerEntry> = {};
let currentId = 0;

// Track initialization state
let isInitialized = false;

// Reference to Figma API for type checking only
declare const figma: {
  ui: {
    postMessage: (message: any) => void;
    onmessage?: (message: any) => void;
  }
};

/**
 * Event object creation function
 * Returns an object with on/emit methods based on the event name
 * 
 * @param name - Event name
 * @returns Object with methods for event handling
 * 
 * @example
 * // Basic usage
 * event('selection-change').on((payload) => {
 *   console.log(payload);
 * });
 * 
 * event('selection-change').emit({ ids: ['1', '2'] });
 */
export function event<TName extends string = string>(name: TName) {
  return {
    /**
     * Register event handler
     * @param handler Function to execute when the event occurs
     * @returns Function to unregister the event handler
     * 
     * @example
     * const unsubscribe = event('selection-change').on((payload) => {
     *   console.log(payload);
     * });
     * 
     * // Unregister handler
     * unsubscribe();
     */
    on<T = any>(handler: EventHandler<T>): () => void {
      const id = `${currentId}`;
      currentId += 1;
      eventHandlers[id] = { handler, name };
      return function (): void {
        delete eventHandlers[id];
      };
    },

    /**
     * Register one-time event handler
     * @param handler Function to execute once when the event occurs
     * @returns Function to unregister the event handler
     * 
     * @example
     * event('notification').once((payload) => {
     *   console.log('This message will be displayed only once:', payload.message);
     * });
     */
    once<T = any>(handler: EventHandler<T>): () => void {
      let done = false;
      return this.on(function (payload: T): void {
        if (done === true) {
          return;
        }
        done = true;
        handler(payload);
      });
    },

    /**
     * Emit an event
     * @param payload Data to send with the event
     * 
     * @example
     * event('notification').emit({ 
     *   message: 'Task completed', 
     *   type: 'info' 
     * });
     */
    emit<T = any>(payload: T): void {
      if (typeof window === 'undefined') {
        // Send message from main context to UI context
        figma.ui.postMessage([name, payload]);
      } else {
        // Send message from UI context to main context
        window.parent.postMessage(
          {
            pluginMessage: [name, payload]
          },
          '*'
        );
      }
    }
  };
}

/**
 * Utility function: Extract EventMap type from array of event names or Record
 * 
 * @example
 * type MyEvents = InferEventMap<["event1", "event2"]>; 
 * // { event1: any, event2: any }
 * 
 * type MyEvents = InferEventMap<{
 *   event1: string;
 *   event2: { id: number; name: string };
 * }>;
 * // { event1: string, event2: { id: number; name: string } }
 */
export type InferEventMap<T extends string[] | Record<string, any>> = T extends string[]
  ? { [K in T[number]]: any }
  : T;

/**
 * Create a typed event system
 * 
 * @returns Function that takes an event name and returns typed event handling methods
 * 
 * @example
 * // Define event map
 * interface PluginEvents {
 *   'selection-change': { ids: string[] };
 *   'document-update': { timestamp: number };
 *   'notification': { message: string; type: 'info' | 'warning' | 'error' };
 * }
 * 
 * // Create typed event system
 * const myEvents = createEventSystem<PluginEvents>();
 * 
 * // Listen for events (payload type is automatically inferred)
 * myEvents('selection-change').on((payload) => {
 *   // payload is automatically inferred as { ids: string[] }
 *   console.log(`Selected items: ${payload.ids.length}`);
 * });
 * 
 * // Emit events (with payload type checking)
 * myEvents('selection-change').emit({ ids: ['1', '2', '3'] });
 */
export function createEventSystem<T extends EventMap>() {
  // Initialize event system
  initEventHandlers();
  
  return <K extends keyof T & string>(eventName: K) => {
    type EventPayload = T[K];
    return {
      on: (handler: EventHandler<EventPayload>) => event(eventName).on(handler),
      once: (handler: EventHandler<EventPayload>) => event(eventName).once(handler),
      emit: (payload: EventPayload) => event(eventName).emit(payload)
    };
  };
}

// Function to invoke event handler
function invokeEventHandler(name: string, payload: any): void {
  let invoked = false;
  for (const id in eventHandlers) {
    if (eventHandlers[id].name === name) {
      eventHandlers[id].handler(payload);
      invoked = true;
    }
  }
  if (invoked === false) {
    console.warn(`No event handler with name \`${name}\``);
  }
}

// Function to initialize event system
function initEventHandlers(): void {
  // Check if already initialized
  if (isInitialized) {
    return;
  }

  if (typeof window === 'undefined') {
    // Main context (Figma plugin internal)
    figma.ui.onmessage = function (args: unknown): void {
      if (!Array.isArray(args)) {
        return;
      }
      
      if (args.length < 1 || typeof args[0] !== 'string') {
        return;
      }
      
      const name = args[0];
      const payload = args.length > 1 ? args[1] : undefined;
      invokeEventHandler(name, payload);
    };
  } else {
    // UI context (iframe)
    window.onmessage = function (event: MessageEvent): void {
      if (typeof event.data.pluginMessage === 'undefined') {
        return;
      }
      
      const args = event.data.pluginMessage;
      if (!Array.isArray(args) || args.length < 1) {
        return;
      }
      
      const name = args[0];
      if (typeof name !== 'string') {
        return;
      }
      
      const payload = args.length > 1 ? args[1] : undefined;
      invokeEventHandler(name, payload);
    };
  }
  
  isInitialized = true;
}

// Initialize the base event system
initEventHandlers();

/**
 * Register event handler function (maintain backwards compatibility with create-figma-plugin)
 * 
 * @param name Event name
 * @param handler Event handler function
 * @returns Function to unregister the event handler
 * 
 * @example
 * // Original style event listening
 * const unsubscribe = on('selection-change', (payload) => {
 *   console.log('Selection changed:', payload);
 * });
 * 
 * // Unregister handler
 * unsubscribe();
 */
export function on<T = any>(name: string, handler: EventHandler<T>): () => void {
  return event(name).on(handler);
}

/**
 * Register one-time event handler function (maintain backwards compatibility with create-figma-plugin)
 * 
 * @param name Event name
 * @param handler Event handler function
 * @returns Function to unregister the event handler
 * 
 * @example
 * // Original style one-time event listening
 * once('notification', (payload) => {
 *   console.log('Notification (one-time):', payload);
 * });
 */
export function once<T = any>(name: string, handler: EventHandler<T>): () => void {
  return event(name).once(handler);
}

/**
 * Emit event function (maintain backwards compatibility with create-figma-plugin)
 * 
 * @param name Event name
 * @param payload Data to send with the event
 * 
 * @example
 * // Original style event emission
 * emit('selection-change', { ids: ['1', '2', '3'] });
 */
export function emit<T = any>(name: string, payload: T): void {
  event(name).emit(payload);
}
