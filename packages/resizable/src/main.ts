import { EventHandler, on } from "@create-figma-plugin/utilities";

const FIGMAZING_WINDOW_SIZE_KEY = "FIGMAZING:windowSize";

export interface ResizeWindowHandler extends EventHandler {
  name: "FIGMAZING:RESIZE_WINDOW";
  handler: (width: number, height: number) => void;
}

export const onResizeWindow = () =>
  on<ResizeWindowHandler>("FIGMAZING:RESIZE_WINDOW", (w, h) => {
    figma.ui.resize(w, h);
    figma.clientStorage.setAsync(FIGMAZING_WINDOW_SIZE_KEY, { w, h });
  });

export const restoreWindowSize = async () => {
  const { w, h } = (await figma.clientStorage.getAsync(FIGMAZING_WINDOW_SIZE_KEY)) as { w: number; h: number };
  figma.ui.resize(w, h);
};
