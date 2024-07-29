/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import App from "./App";
import { openInNewTabAndBackIfN } from "./redirect";

if (!openInNewTabAndBackIfN()) {
  render(() => <App />, document.getElementById("root")!);
}
