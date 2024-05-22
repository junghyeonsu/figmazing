# @figmazing/resizable

### install

```bash
yarn add @figmazing/resizable
```

### usage

> Both `ui` and `main` are required to use this package.

```tsx
// ui
import { Resizable } from "@figmazing/resizable";

// create a resizable component

const App = () => {
  return (
    <Resizable
      style={{
        position: "fixed",
        bottom: "2px",
        right: "2px",
        width: "16px",
        height: "16px",
      }}
    />
  );
};
```

```ts
// main.ts
import { restoreWindowSize, onResizeWindow } from "@figmazing/resizable/main";

function app() {
  // !! Necessary
  // listen to window resize event
  onResizeWindow();

  // ?? Optional
  // restore last size when the plugin is opened
  restoreWindowSize();
}
```
