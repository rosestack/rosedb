import { defineRosepack } from "rosepack";

export default defineRosepack({
  entry: "source/index.ts",
  output: {
    format: [
      "cjs",
      "esm",
    ],
    entryName: "[name].[format].js",
    chunkName: "[hash].[format].js",
  },
  declaration: true,
  clean: true,
});