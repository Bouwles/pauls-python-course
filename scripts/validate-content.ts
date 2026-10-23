// Same checks as the build, without writing anything. Used in CI.
export {};
process.argv.push("--check");
await import("./build-content");
