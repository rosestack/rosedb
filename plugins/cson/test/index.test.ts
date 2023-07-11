import { describe, it, expect } from "vitest";

import { AsyncRoseCson, SyncRoseCson } from "@rosedb/cson";

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

describe("AsyncRoseCson", () => {
  const asyncRoseCson = new AsyncRoseCson<Data>({
    file: "test/cache/asyncRoseCson.cson",
    default: data,
    mkfile: true,
  });

  it("should init asyncRoseCson", async () => {
    await asyncRoseCson.init();
  });

  it("should equal default data", () => {
    expect(asyncRoseCson.data).toEqual(data);
  });

  it("should set data", async () => {
    await asyncRoseCson.set("name", "meslzy");
    expect(asyncRoseCson.data.name).toEqual("meslzy");
  });

  it("should get data", async () => {
    expect(await asyncRoseCson.get("name")).toEqual("meslzy");
  });

  it("should delete data", async () => {
    await asyncRoseCson.delete("name");
    expect(asyncRoseCson.data.name).toEqual(undefined);
  });

  it("should clear data", async () => {
    await asyncRoseCson.clear();
    expect(asyncRoseCson.data).toEqual({});
  });

  it("should reset data", async () => {
    await asyncRoseCson.reset();
    expect(asyncRoseCson.data).toEqual(data);
  });

  it("should emit changes event", async () => {
    await asyncRoseCson.reset();

    asyncRoseCson.onChange((newData, oldData) => {
      expect(newData).toEqual({ name: "meslzy" });
      expect(oldData).toEqual({ name: "rosedb" });
    });

    asyncRoseCson.onKeyChange("name", (newValue, oldValue) => {
      expect(newValue).toEqual("meslzy");
      expect(oldValue).toEqual("rosedb");
    });

    await asyncRoseCson.set("name", "meslzy");
  });
});

describe("SyncRoseCson", () => {
  const syncRoseCson = new SyncRoseCson<Data>({
    file: "test/cache/syncRoseCson.cson",
    default: data,
    mkfile: true,
  });

  it("should init syncRoseCson", () => {
    syncRoseCson.init();
  });

  it("should equal default data", () => {
    expect(syncRoseCson.data).toEqual(data);
  });

  it("should set data", () => {
    syncRoseCson.set("name", "meslzy");
    expect(syncRoseCson.data.name).toEqual("meslzy");
  });

  it("should get data", () => {
    expect(syncRoseCson.get("name")).toEqual("meslzy");
  });

  it("should delete data", () => {
    syncRoseCson.delete("name");
    expect(syncRoseCson.data.name).toEqual(undefined);
  });

  it("should clear data", () => {
    syncRoseCson.clear();
    expect(syncRoseCson.data).toEqual({});
  });

  it("should reset data", () => {
    syncRoseCson.reset();
    expect(syncRoseCson.data).toEqual(data);
  });

  it("should emit changes event", () => {
    syncRoseCson.reset();

    syncRoseCson.onChange((newData, oldData) => {
      expect(newData).toEqual({ name: "meslzy" });
      expect(oldData).toEqual({ name: "rosedb" });
    });

    syncRoseCson.onKeyChange("name", (newValue, oldValue) => {
      expect(newValue).toEqual("meslzy");
      expect(oldValue).toEqual("rosedb");
    });

    syncRoseCson.set("name", "meslzy");
  });
});