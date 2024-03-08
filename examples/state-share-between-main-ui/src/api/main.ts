import { emit, on, showUI } from "@create-figma-plugin/utilities";
import { CheckBearsHandler } from "../types";

function stateHandler() {
  const ID = "FIGMAZING";

  const defaultValue = {
    value: 0,
  };

  const state: Record<string, any> = defaultValue;

  const update = <T>(key: string, value: (prev: T) => T | any) => {
    if (typeof value === "function") {
      const newValue = value(state[key]);
      state[key] = newValue;
      emit(`${ID}::update`, { key, value: newValue });
    } else {
      state[key] = value;
      emit(`${ID}::update`, { key, value });
    }
  };

  on(`${ID}::update`, ({ key, value }) => {
    console.log("update", key, value);

    state[key] = value;
  });

  return {
    state,
    update,
  };
}

export default function () {
  const { state, update } = stateHandler();

  on<CheckBearsHandler>("CHECK_STATE", () => {
    console.log("Check bears in main.ts", JSON.stringify(state, null, 2));
  });

  on("INCREASE_VALUE_IN_MAIN", () => {
    update<number>("value", (value) => value + 1);
  });

  on("DECREASE_VALUE_IN_MAIN", () => {
    update<number>("value", (value) => value - 1);
  });
  showUI({ height: 500, width: 360 });
}
