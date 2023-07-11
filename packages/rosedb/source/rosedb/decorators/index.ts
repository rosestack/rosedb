import type RoseDB from "~/rosedb";

const ThrowIfNotInitiated = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
  const originalMethod = descriptor.value;

  descriptor.value = function (this: RoseDB<any, any>, ...args: any[]) {
    this.throwIfNotInitiated();
    return originalMethod.apply(this, args);
  };
};

const ThrowIfInitiated = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
  const originalMethod = descriptor.value;

  descriptor.value = function (this: RoseDB<any, any>, ...args: any[]) {
    this.throwIfInitiated();
    return originalMethod.apply(this, args);
  };
};

export {
  ThrowIfNotInitiated,
  ThrowIfInitiated,
};