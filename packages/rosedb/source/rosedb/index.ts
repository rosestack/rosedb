import RoseDBEvents from "~/rosedb/events";

import { ThrowIfInitiated, ThrowIfNotInitiated } from "~/rosedb/decorators";

import type { MaybePromise } from "~/utils/types";

interface RoseDBOptions<Data> {
  default?: Data;
}

abstract class RoseDB<Data extends Record<string, any>, Async extends boolean> extends RoseDBEvents<Data, Async> {
  protected initiated = false;

  abstract options: RoseDBOptions<Data>;

  data: Data;

  protected createDataProxy = (data: Data) => {
    return new Proxy<Data>({ ...data }, {
      set: (target: Data, props: string, newValue: any, receiver: any) => {
        const oldData = { ...target };
        const oldValue = Reflect.get(target, props);

        const setter = Reflect.set(target, props, newValue, receiver);

        this.emit(`onKeyChange:${ props }`, newValue, oldValue);
        this.emit("onChange", { ...target }, oldData);

        return setter;
      },
      deleteProperty: (target: Data, props: string) => {
        const oldValue = Reflect.get(target, props);
        const oldData = { ...target };

        const deleteProperty = Reflect.deleteProperty(target, props);

        this.emit(`onKeyChange:${ props }`, undefined, oldValue);
        this.emit("onChange", { ...target }, oldData);

        return deleteProperty;
      },
    });
  };

  protected throwIfNotInitiated = () => {
    if ( !this.initiated ) {
      throw new Error("RoseDB is not initiated");
    }
  };

  protected throwIfInitiated = () => {
    if ( this.initiated ) {
      throw new Error("RoseDB is already initiated");
    }
  };

  abstract init(): MaybePromise<void>;

  //

  abstract get<Key extends keyof Data, Default = undefined>(key: Key, defaultValue?: Default): Data[Key] | Default;

  abstract has<Key extends keyof Data>(key: Key): boolean;

  abstract set<Key extends keyof Data>(key: Key, value: Data[Key]): MaybePromise<boolean>;

  abstract delete<Key extends keyof Data>(key: Key): MaybePromise<boolean>;

  //

  abstract clear(): MaybePromise<void>;

  abstract reset(): MaybePromise<void>;
}

abstract class AsyncRoseDB<Data extends Record<string, any>> extends RoseDB<Data, true> {
  abstract save(data: Data): Promise<void>;

  abstract load(): Promise<Data | null>;

  @ThrowIfInitiated
  async init() {
    const loadedData = await this.load();
    const defaultData = (this.options.default ?? {}) as Data;

    this.data = this.createDataProxy(loadedData ?? defaultData);

    await this.save(this.data);

    this.initiated = true;
  }

  @ThrowIfNotInitiated
  get<Key extends keyof Data, Default = undefined>(key: Key, defaultValue?: Default) {
    return (Reflect.get(this.data, key) ?? defaultValue) as Data[Key] | Default;
  }

  @ThrowIfNotInitiated
  has<Key extends keyof Data>(key: Key) {
    return Reflect.has(this.data, key);
  }

  @ThrowIfNotInitiated
  async set<Key extends keyof Data>(key: Key, value: Data[Key]) {
    const setter = Reflect.set(this.data, key, value);

    await this.save(this.data);

    return setter;
  }

  @ThrowIfNotInitiated
  async delete<Key extends keyof Data>(key: Key) {
    const deleter = Reflect.deleteProperty(this.data, key);

    await this.save(this.data);

    return deleter;
  }

  @ThrowIfNotInitiated
  async clear() {
    const oldData = this.data;
    this.data = this.createDataProxy({} as Data);

    this.emit("onChange", { ...this.data }, oldData);

    return this.save(this.data);
  }

  @ThrowIfNotInitiated
  async reset() {
    const oldData = this.data;
    this.data = this.createDataProxy(this.options.default ?? {} as Data);

    this.emit("onChange", { ...this.data }, oldData);

    return this.save(this.data);
  }
}

abstract class SyncRoseDB<Data extends Record<string, any>> extends RoseDB<Data, false> {
  abstract save(data: Data): void;

  abstract load(): Data | null;

  @ThrowIfInitiated
  init() {
    const loadedData = this.load();
    const defaultData = (this.options.default ?? {}) as Data;

    this.data = this.createDataProxy(loadedData ?? defaultData);

    this.save(this.data);

    this.initiated = true;
  }

  @ThrowIfNotInitiated
  get<Key extends keyof Data, Default = undefined>(key: Key, defaultValue?: Default) {
    return (Reflect.get(this.data, key) ?? defaultValue) as Data[Key] | Default;
  }

  @ThrowIfNotInitiated
  has<Key extends keyof Data>(key: Key) {
    return Reflect.has(this.data, key);
  }

  @ThrowIfNotInitiated
  set<Key extends keyof Data>(key: Key, value: Data[Key]) {
    const setter = Reflect.set(this.data, key, value);

    this.save(this.data);

    return setter;
  }

  @ThrowIfNotInitiated
  delete<Key extends keyof Data>(key: Key) {
    const deleter = Reflect.deleteProperty(this.data, key);

    this.save(this.data);

    return deleter;
  }

  @ThrowIfNotInitiated
  clear() {
    this.data = this.createDataProxy({} as Data);

    return this.save(this.data);
  }

  @ThrowIfNotInitiated
  reset() {
    this.data = this.createDataProxy(this.options.default ?? {} as Data);

    return this.save(this.data);
  }
}

export type {
  RoseDBOptions,
};

export {
  AsyncRoseDB,
  SyncRoseDB,
};

export default RoseDB;