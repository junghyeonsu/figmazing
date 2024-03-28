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
// main
import "@figmazing/resizable/main";
```
