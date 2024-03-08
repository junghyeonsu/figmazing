import { EventHandler, on } from "@create-figma-plugin/utilities";

const WINDOW_SIZE_KEY = "windowSize";
export interface ResizeWindowHandler extends EventHandler {
  name: "RESIZE_WINDOW";
  handler: (width: number, height: number) => void;
}

(function main() {
  on<ResizeWindowHandler>("RESIZE_WINDOW", (w, h) => {
    figma.ui.resize(w, h);
    figma.clientStorage.setAsync(WINDOW_SIZE_KEY, { w, h });
  });
})();
