import { describe, it, expect } from "vitest";

import { AsyncRoseIni, SyncRoseIni } from "@rosedb/ini";

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

describe("AsyncRoseIni", () => {
  const asyncRoseIni = new AsyncRoseIni<Data>({
    file: "test/cache/asyncRoseIni.ini",
    default: data,
    mkfile: true,
  });

  it("should init asyncRoseIni", async () => {
    await asyncRoseIni.init();
  });

  it("should equal default data", () => {
    expect(asyncRoseIni.data).toEqual(data);
  });

  it("should set data", async () => {
    await asyncRoseIni.set("name", "meslzy");
    expect(asyncRoseIni.data.name).toEqual("meslzy");
  });

  it("should get data", async () => {
    expect(await asyncRoseIni.get("name")).toEqual("meslzy");
  });

  it("should delete data", async () => {
    await asyncRoseIni.delete("name");
    expect(asyncRoseIni.data.name).toEqual(undefined);
  });

  it("should clear data", async () => {
    await asyncRoseIni.clear();
    expect(asyncRoseIni.data).toEqual({});
  });

  it("should reset data", async () => {
    await asyncRoseIni.reset();
    expect(asyncRoseIni.data).toEqual(data);
  });

  it("should emit changes event", async () => {
    await asyncRoseIni.reset();

    asyncRoseIni.onChange((newData, oldData) => {
      expect(newData).toEqual({ name: "meslzy" });
      expect(oldData).toEqual({ name: "rosedb" });
    });

    asyncRoseIni.onKeyChange("name", (newValue, oldValue) => {
      expect(newValue).toEqual("meslzy");
      expect(oldValue).toEqual("rosedb");
    });

    await asyncRoseIni.set("name", "meslzy");
  });
});

describe("SyncRoseIni", () => {
  const syncRoseIni = new SyncRoseIni<Data>({
    file: "test/cache/syncRoseIni.ini",
    default: data,
    mkfile: true,
  });

  it("should init syncRoseIni", () => {
    syncRoseIni.init();
  });

  it("should equal default data", () => {
    expect(syncRoseIni.data).toEqual(data);
  });

  it("should set data", () => {
    syncRoseIni.set("name", "meslzy");
    expect(syncRoseIni.data.name).toEqual("meslzy");
  });

  it("should get data", () => {
    expect(syncRoseIni.get("name")).toEqual("meslzy");
  });

  it("should delete data", () => {
    syncRoseIni.delete("name");
    expect(syncRoseIni.data.name).toEqual(undefined);
  });

  it("should clear data", () => {
    syncRoseIni.clear();
    expect(syncRoseIni.data).toEqual({});
  });

  it("should reset data", () => {
    syncRoseIni.reset();
    expect(syncRoseIni.data).toEqual(data);
  });

  it("should emit changes event", () => {
    syncRoseIni.reset();

    syncRoseIni.onChange((newData, oldData) => {
      expect(newData).toEqual({ name: "meslzy" });
      expect(oldData).toEqual({ name: "rosedb" });
    });

    syncRoseIni.onKeyChange("name", (newValue, oldValue) => {
      expect(newValue).toEqual("meslzy");
      expect(oldValue).toEqual("rosedb");
    });

    syncRoseIni.set("name", "meslzy");
  });
});