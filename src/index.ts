import { Injector, Logger } from "replugged";

const inject = new Injector();
const logger = Logger.plugin("go-plugged");

// const wasmRemote = "http://localhost/main.wasm";
const wasmRemote = "https://merith.xyz/main.wasm";
const wasmExecRemote = "https://merith.xyz/wasm_exec.js";

export async function start(): Promise<void> {
  // Fetch wasmExecRemote and load it into the HTML body
  console.log("Fetching wasm_exec.js...");
  const wasmExecResponse = await fetch(wasmExecRemote);
  const wasmExecCode = await wasmExecResponse.text();
  document.body.innerHTML += wasmExecCode;

  console.log("wasm_exec.js loaded");
  // Check if the Go object is defined
  if (typeof Go == "undefined") {
    console.log("Failed to inject wasm_exec.js");
    return;
  } else {
    console.log("wasm_exec.js was injected successfully");

    const go = new Go();

    // Fetch wasmRemote and load it as wasm code
    const wasmResponse = await fetch(wasmRemote);
    const wasmBuffer = await wasmResponse.arrayBuffer();
    const wasmModule = await WebAssembly.instantiate(wasmBuffer, go.importObject);

    console.log("wasmModule:", wasmModule.instance.exports.run);

    // Run the wasm code
    go.run(wasmModule.instance);
  }
}

export function stop(): void {
  inject.uninjectAll();
}
