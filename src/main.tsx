import { createRoot } from "react-dom/client";
import { Buffer } from "buffer";
import "./index.css";
import "@solana/wallet-adapter-react-ui/styles.css";

globalThis.Buffer ??= Buffer;

void import("./App.tsx").then(({ default: App }) => {
  createRoot(document.getElementById("root")!).render(<App />);
});
