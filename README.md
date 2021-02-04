## A\* pathfinder visualization

The pathfinding algorithm is written in Rust, then compiled to WebAssembly. The frontend is built (mostly) with React.

#### Building the project from source

Assuming you have `wasm-pack` installed, run the following in the root directory:

```shell
wasm-pack build
```

to avoid publishing it via `npm`, we will just link the projects. Change directory to `pkg`, and link it:

```shell
cd pkg && npm link
```

then move into the `pathfinder` directory, install dependencies and link `pathfinder-wasm`:

```shell
cd ../pathfinder && npm install && npm link pathfinder-wasm
```

After that the application is ready to be started with `npm start`.

There is a lot of room for simplification and refactoring, and also the React state variables
should be better arranged.

#### TODO

- Add more mazes
- Moveable starting node
- Throttle wall toggle events
