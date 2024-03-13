import { EventHandler, on } from "@create-figma-plugin/utilities";

const WINDOW_SIZE_KEY = "FIGMAZING:windowSize";

export interface ResizeWindowHandler extends EventHandler {
  name: "FIGMAZING:RESIZE_WINDOW";
  handler: (width: number, height: number) => void;
}

const onResizeWindow = () =>
  on<ResizeWindowHandler>("FIGMAZING:RESIZE_WINDOW", (w, h) => {
    figma.ui.resize(w, h);
    figma.clientStorage.setAsync(WINDOW_SIZE_KEY, { w, h });
  });

onResizeWindow();
