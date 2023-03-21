import * as React from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Button } from "$lib/components/Button";
import useToast from "./useToast";

const reloadSW = "__RELOAD_SW__" as string;

export default function usePwaUpdate() {
  const { addToast } = useToast();
  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (reloadSW === "true") {
        r &&
          setInterval(() => {
            console.log("Checking for sw update");
            r.update();
          }, 20000 /* 20s for testing purposes */);
      } else {
        console.log("SW Registered: " + r);
      }
    },
    onRegisterError(error: any) {
      console.log("SW registration error", error);
    },
  });

  React.useEffect(() => {
    if (offlineReady) {
      addToast("App ready to work offline");
    }
  }, [offlineReady]);

  React.useEffect(() => {
    if (needRefresh) {
      addToast(
        <>
          <span>New content available, click</span>
          <Button onClick={() => updateServiceWorker(true)}>here</Button>
          <span>to reload.</span>
        </>,
        "message",
        null
      );
    }
  }, [needRefresh]);
}
