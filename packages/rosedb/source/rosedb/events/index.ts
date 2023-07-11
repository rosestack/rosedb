type MaybeAsync<Async, Type> = Async extends true ? Promise<Type> | Type : Type;

type Callback<Async extends boolean> = (...args: any) => MaybeAsync<Async, any>;

type ChangeCallback<Data extends Record<string, any>> = (newData: Data, oldData: Data) => void;

type KeyChangeCallback<Value> = (newValue: Value, oldValue: Value) => void;

class RoseDBEvents<Data extends Record<string, any>, Async extends boolean> {
  private events: Map<string, Callback<Async>[]>;

  constructor() {
    this.events = new Map();
  }

  protected addEvent(name: string, callback: Callback<Async>) {
    const event = this.events.get(name) ?? [];

    const index = event.push(callback);

    this.events.set(name, event);

    return () => {
      event.splice(index, 1);
    };
  }

  protected getEvents(name: string) {
    return this.events.get(name) ?? [];
  }

  emit = (name: string, ...args: any) => {
    const events = this.getEvents(name);

    for ( const event of events ) {
      event(...args);
    }
  };

  onChange(callback: ChangeCallback<Data>) {
    return this.addEvent("onChange", callback);
  }

  onKeyChange<Key extends keyof Data>(key: Key, callback: KeyChangeCallback<Data[Key]>) {
    return this.addEvent(`onKeyChange:${ key.toString() }`, callback);
  }
}

export default RoseDBEvents;