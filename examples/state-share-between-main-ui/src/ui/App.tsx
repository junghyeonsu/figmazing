import { render } from "@create-figma-plugin/ui";
// biome-ignore lint/correctness/noUnusedVariables: <explanation>
import { h } from "preact";
import StoreProvider from "./StoreProvider";
import UI from "./ui";

function App() {
  return (
    <StoreProvider>
      <UI />
    </StoreProvider>
  );
}

export default render(App);
