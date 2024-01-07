import { Logger } from "replugged";

interface CustomWindow extends Window {
  Go?: typeof Go;
}

declare const window: CustomWindow;

const logger = Logger.plugin("go-plugged");

const wasmExecScript = document.createElement("script");
wasmExecScript.onloadstart = () => logger.log("Loading wasm_exec.js");
wasmExecScript.onerror = () => logger.log("wasm_exec.js failed to load");

// const wasmRemote = "http://localhost/main.wasm";
const wasmRemote = "https://merith.xyz/main.wasm";
const wasmExecRemote = "https://merith.xyz/wasm_exec.js";

export const start = (): void => {
  wasmExecScript.onload = async () => {
    if (window.Go) {
      const go = new window.Go();

      const wasmModule = await fetch(wasmRemote)
        .then(async (res) => WebAssembly.instantiate(await res.arrayBuffer(), go.importObject))
        .catch((e) => logger.error("Error occurred while instantiating wasmModule", e));

      if (wasmModule) {
        logger.log("wasmModule:", wasmModule.instance.exports.run);
        void go.run(wasmModule.instance);
      }
    }
  };

  // the script tag begins downloading as soon as its src is set
  // so we won't be able to catch errors or wait for it - we have to set it here
  wasmExecScript.src = wasmExecRemote;

  document.head.appendChild(wasmExecScript);
};

export const stop = (): void => wasmExecScript.remove();
