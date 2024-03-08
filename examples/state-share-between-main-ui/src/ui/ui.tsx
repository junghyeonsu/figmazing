import { Button } from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
// biome-ignore lint/correctness/noUnusedVariables: <explanation>
import { Fragment, h } from "preact";
import { useStore } from "./StoreProvider";

function UI() {
  const { state, update } = useStore();

  return (
    <Fragment>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Button onClick={() => update("value", (prev: number) => prev + 1)}>Increase Value In UI</Button>
        <Button onClick={() => update("value", (prev: number) => prev - 1)}>Decrease Value In UI</Button>
        <Button onClick={() => emit("INCREASE_VALUE_IN_MAIN")}>Increase State In Main</Button>
        <Button onClick={() => emit("DECREASE_VALUE_IN_MAIN")}>Decrease State In Main</Button>
        <Button onClick={() => emit("CHECK_STATE")}>Check State</Button>
        current bears: {JSON.stringify(state, null, 2)}
      </div>
    </Fragment>
  );
}

export default UI;
