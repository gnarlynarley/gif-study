import { Suspense } from "react";
import { RecoilRoot } from "recoil";
import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.createElement("div");
document.body.appendChild(container);
const root = createRoot(container);

root.render(
  <Suspense>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </Suspense>
);
