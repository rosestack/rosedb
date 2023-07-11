import { describe, it, expect } from "vitest";

import { AsyncRoseYaml, SyncRoseYaml } from "@rosedb/yaml";

import fs from "fs";

interface Data {
  name: string;
}

const data: Data = {
  name: "rosedb",
};

if ( fs.existsSync("test/cache") ) {
  await fs.promises.rm("test/cache", {
    recursive: true,
    force: true,
  });
}

describe("AsyncRoseYaml", () => {
  const asyncRoseYaml = new AsyncRoseYaml<Data>({
    file: "test/cache/asyncRoseYaml.yaml",
    default: data,
    mkfile: true,
  });

  it("should init asyncRoseYaml", async () => {
    await asyncRoseYaml.init();
  });

  it("should equal default data", () => {
    expect(asyncRoseYaml.data).toEqual(data);
  });

  it("should set data", async () => {
    await asyncRoseYaml.set("name", "meslzy");
    expect(asyncRoseYaml.data.name).toEqual("meslzy");
  });

  it("should get data", async () => {
    expect(await asyncRoseYaml.get("name")).toEqual("meslzy");
  });

  it("should delete data", async () => {
    await asyncRoseYaml.delete("name");
    expect(asyncRoseYaml.data.name).toEqual(undefined);
  });

  it("should clear data", async () => {
    await asyncRoseYaml.clear();
    expect(asyncRoseYaml.data).toEqual({});
  });

  it("should reset data", async () => {
    await asyncRoseYaml.reset();
    expect(asyncRoseYaml.data).toEqual(data);
  });

  it("should emit changes event", async () => {
    await asyncRoseYaml.reset();

    asyncRoseYaml.onChange((newData, oldData) => {
      expect(newData).toEqual({ name: "meslzy" });
      expect(oldData).toEqual({ name: "rosedb" });
    });

    asyncRoseYaml.onKeyChange("name", (newValue, oldValue) => {
      expect(newValue).toEqual("meslzy");
      expect(oldValue).toEqual("rosedb");
    });

    await asyncRoseYaml.set("name", "meslzy");
  });
});

describe("SyncRoseYaml", () => {
  const syncRoseYaml = new SyncRoseYaml<Data>({
    file: "test/cache/syncRoseYaml.yaml",
    default: data,
    mkfile: true,
  });

  it("should init syncRoseYaml", () => {
    syncRoseYaml.init();
  });

  it("should equal default data", () => {
    expect(syncRoseYaml.data).toEqual(data);
  });

  it("should set data", () => {
    syncRoseYaml.set("name", "meslzy");
    expect(syncRoseYaml.data.name).toEqual("meslzy");
  });

  it("should get data", () => {
    expect(syncRoseYaml.get("name")).toEqual("meslzy");
  });

  it("should delete data", () => {
    syncRoseYaml.delete("name");
    expect(syncRoseYaml.data.name).toEqual(undefined);
  });

  it("should clear data", () => {
    syncRoseYaml.clear();
    expect(syncRoseYaml.data).toEqual({});
  });

  it("should reset data", () => {
    syncRoseYaml.reset();
    expect(syncRoseYaml.data).toEqual(data);
  });

  it("should emit changes event", () => {
    syncRoseYaml.reset();

    syncRoseYaml.onChange((newData, oldData) => {
      expect(newData).toEqual({ name: "meslzy" });
      expect(oldData).toEqual({ name: "rosedb" });
    });

    syncRoseYaml.onKeyChange("name", (newValue, oldValue) => {
      expect(newValue).toEqual("meslzy");
      expect(oldValue).toEqual("rosedb");
    });

    syncRoseYaml.set("name", "meslzy");
  });
});