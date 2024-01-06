setup:
	pnpm i
	pnpm run watch
serve-wasm:
	GOOS=js GOARCH=wasm go build -o ./main.wasm ./src/wasm
	caddy file-server
