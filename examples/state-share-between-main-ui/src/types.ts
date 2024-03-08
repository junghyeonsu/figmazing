import { EventHandler } from "@create-figma-plugin/utilities";

export interface CheckBearsHandler extends EventHandler {
  name: "CHECK_STATE";
  handler: () => void;
}
