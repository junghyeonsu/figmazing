// biome-ignore lint/correctness/noUnusedVariables: <explanation>
import { h } from "preact";
import {
  Button,
  Columns,
  Container,
  Muted,
  render,
  Text,
  TextboxNumeric,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
import { useCallback, useState } from "preact/hooks";
// import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

// import type { AppRouter } from "../api/main";
import type { CreateRectanglesHandler } from "../types";

// const client = createTRPCProxyClient<AppRouter>({
//   links: [httpBatchLink({ url: "http://localhost:3000" })],
// });

function Plugin() {
  const [count, setCount] = useState<number | null>(5);
  const [countString, setCountString] = useState("5");

  const handleCreateRectanglesButtonClick = useCallback(
    function () {
      if (count !== null) {
        emit<CreateRectanglesHandler>("CREATE_RECTANGLES", count);
      }
    },
    [count],
  );

  // const notify = () => {
  //   client.notify.query({ message: "hello" });
  // };

  return (
    <Container space="medium">
      <VerticalSpace space="large" />
      <Text>
        <Muted>Count</Muted>
      </Text>
      <VerticalSpace space="small" />
      <TextboxNumeric
        onNumericValueInput={setCount}
        onValueInput={setCountString}
        value={countString}
        variant="border"
      />
      <VerticalSpace space="extraLarge" />
      <Columns space="extraSmall">
        <Button fullWidth onClick={handleCreateRectanglesButtonClick}>
          Create
        </Button>
        {/* <Button fullWidth onClick={notify}>
          Notify
        </Button> */}
      </Columns>
      <VerticalSpace space="small" />
    </Container>
  );
}

export default render(Plugin);
