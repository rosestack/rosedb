import { describe, it, expect } from "vitest";

import { AsyncRoseJson, SyncRoseJson } from "@rosedb/json";

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

describe("AsyncRoseJson", () => {
  const asyncRoseJson = new AsyncRoseJson<Data>({
    file: "test/cache/asyncRoseJson.json",
    default: data,
    mkfile: true,
  });

  it("should init asyncRoseJson", async () => {
    await asyncRoseJson.init();
  });

  it("should equal default data", () => {
    expect(asyncRoseJson.data).toEqual(data);
  });

  it("should set data", async () => {
    await asyncRoseJson.set("name", "meslzy");
    expect(asyncRoseJson.data.name).toEqual("meslzy");
  });

  it("should get data", async () => {
    expect(await asyncRoseJson.get("name")).toEqual("meslzy");
  });

  it("should delete data", async () => {
    await asyncRoseJson.delete("name");
    expect(asyncRoseJson.data.name).toEqual(undefined);
  });

  it("should clear data", async () => {
    await asyncRoseJson.clear();
    expect(asyncRoseJson.data).toEqual({});
  });

  it("should reset data", async () => {
    await asyncRoseJson.reset();
    expect(asyncRoseJson.data).toEqual(data);
  });

  it("should emit changes event", async () => {
    await asyncRoseJson.reset();

    asyncRoseJson.onChange((newData, oldData) => {
      expect(newData).toEqual({ name: "meslzy" });
      expect(oldData).toEqual({ name: "rosedb" });
    });

    asyncRoseJson.onKeyChange("name", (newValue: string, oldValue: string) => {
      expect(newValue).toEqual("meslzy");
      expect(oldValue).toEqual("rosedb");
    });

    await asyncRoseJson.set("name", "meslzy");
  });
});

describe("SyncRoseJson", () => {
  const syncRoseJson = new SyncRoseJson<Data>({
    file: "test/cache/syncRoseJson.json",
    default: data,
    mkfile: true,
  });

  it("should init syncRoseJson", () => {
    syncRoseJson.init();
  });

  it("should equal default data", () => {
    expect(syncRoseJson.data).toEqual(data);
  });

  it("should set data", () => {
    syncRoseJson.set("name", "meslzy");
    expect(syncRoseJson.data.name).toEqual("meslzy");
  });

  it("should get data", () => {
    expect(syncRoseJson.get("name")).toEqual("meslzy");
  });

  it("should delete data", () => {
    syncRoseJson.delete("name");
    expect(syncRoseJson.data.name).toEqual(undefined);
  });

  it("should clear data", () => {
    syncRoseJson.clear();
    expect(syncRoseJson.data).toEqual({});
  });

  it("should reset data", () => {
    syncRoseJson.reset();
    expect(syncRoseJson.data).toEqual(data);
  });

  it("should emit changes event", () => {
    syncRoseJson.reset();

    syncRoseJson.onChange((newData, oldData) => {
      expect(newData).toEqual({ name: "meslzy" });
      expect(oldData).toEqual({ name: "rosedb" });
    });

    syncRoseJson.onKeyChange("name", (newValue, oldValue) => {
      expect(newValue).toEqual("meslzy");
      expect(oldValue).toEqual("rosedb");
    });

    syncRoseJson.set("name", "meslzy");
  });
});