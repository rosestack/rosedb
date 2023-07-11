import { describe, it, expect } from "vitest";

import { AsyncRoseXml, SyncRoseXml } from "@rosedb/xml";

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

describe("AsyncRoseXml", () => {
  const asyncRoseXml = new AsyncRoseXml<Data>({
    file: "test/cache/asyncRoseXml.xml",
    default: data,
    mkfile: true,
  });

  it("should init asyncRoseXml", async () => {
    await asyncRoseXml.init();
  });

  it("should equal default data", () => {
    expect(asyncRoseXml.data).toEqual(data);
  });

  it("should set data", async () => {
    await asyncRoseXml.set("name", "meslzy");
    expect(asyncRoseXml.data.name).toEqual("meslzy");
  });

  it("should get data", async () => {
    expect(await asyncRoseXml.get("name")).toEqual("meslzy");
  });

  it("should delete data", async () => {
    await asyncRoseXml.delete("name");
    expect(asyncRoseXml.data.name).toEqual(undefined);
  });

  it("should clear data", async () => {
    await asyncRoseXml.clear();
    expect(asyncRoseXml.data).toEqual({});
  });

  it("should reset data", async () => {
    await asyncRoseXml.reset();
    expect(asyncRoseXml.data).toEqual(data);
  });

  it("should emit changes event", async () => {
    await asyncRoseXml.reset();

    asyncRoseXml.onChange((newData, oldData) => {
      expect(newData).toEqual({ name: "meslzy" });
      expect(oldData).toEqual({ name: "rosedb" });
    });

    asyncRoseXml.onKeyChange("name", (newValue, oldValue) => {
      expect(newValue).toEqual("meslzy");
      expect(oldValue).toEqual("rosedb");
    });

    await asyncRoseXml.set("name", "meslzy");
  });
});

describe("SyncRoseXml", () => {
  const syncRoseXml = new SyncRoseXml<Data>({
    file: "test/cache/syncRoseXml.xml",
    default: data,
    mkfile: true,
  });

  it("should init syncRoseXml", () => {
    syncRoseXml.init();
  });

  it("should equal default data", () => {
    expect(syncRoseXml.data).toEqual(data);
  });

  it("should set data", () => {
    syncRoseXml.set("name", "meslzy");
    expect(syncRoseXml.data.name).toEqual("meslzy");
  });

  it("should get data", () => {
    expect(syncRoseXml.get("name")).toEqual("meslzy");
  });

  it("should delete data", () => {
    syncRoseXml.delete("name");
    expect(syncRoseXml.data.name).toEqual(undefined);
  });

  it("should clear data", () => {
    syncRoseXml.clear();
    expect(syncRoseXml.data).toEqual({});
  });

  it("should reset data", () => {
    syncRoseXml.reset();
    expect(syncRoseXml.data).toEqual(data);
  });

  it("should emit changes event", () => {
    syncRoseXml.reset();

    syncRoseXml.onChange((newData, oldData) => {
      expect(newData).toEqual({ name: "meslzy" });
      expect(oldData).toEqual({ name: "rosedb" });
    });

    syncRoseXml.onKeyChange("name", (newValue, oldValue) => {
      expect(newValue).toEqual("meslzy");
      expect(oldValue).toEqual("rosedb");
    });

    syncRoseXml.set("name", "meslzy");
  });
});