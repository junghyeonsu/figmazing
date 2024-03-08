import { createContext } from "preact";
import { useContext, useState } from "preact/hooks";

import { emit, on } from "@create-figma-plugin/utilities";
import { h } from "preact";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type State = Record<string, any>;
interface StoreState {
  state: State;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  update: (key: string, value: any) => void;
}
const ID = "FIGMAZING";

const StoreContext = createContext<StoreState | null>(null);

export default function StoreProvider({ children }: { children: h.JSX.Element }) {
  const [state, setState] = useState<State>({
    value: 0,
  });

  on(`${ID}::update`, ({ key, value }) => {
    setState((prev) => ({ ...prev, [key]: value }));
  });

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const update = (key: string, value: any) => {
    if (typeof value === "function") {
      const newValue = value(state[key]);
      setState((prev) => ({ ...prev, [key]: newValue }));
      emit(`${ID}::update`, { key, value: newValue });
    } else {
      setState((prev) => ({ ...prev, [key]: value }));
      emit(`${ID}::update`, { key, value });
    }
  };

  return <StoreContext.Provider value={{ state, update }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("StoreProvider not found");
  }
  return store;
}
