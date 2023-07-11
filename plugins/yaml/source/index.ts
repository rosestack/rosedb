import yaml from "yaml";

import type { RoseDBOptions } from "rosedb";
import { AsyncRoseDB, SyncRoseDB } from "rosedb";

import path from "path";
import fs from "fs";

const utils = {
  resolveFile: (file: string) => {
    if ( path.isAbsolute(file) ) {
      return file;
    }

    return path.resolve(process.cwd(), file);
  },
  defaultSerialize: (data: Record<string, any>) => {
    return yaml.stringify(data);
  },
  defaultDeserialize: (data: string) => {
    return yaml.parse(data);
  },
  defaultEncrypt(data: string) {
    return data.split("").map((char) => {
      return String.fromCharCode(char.charCodeAt(0) + 7);
    }).join("");
  },
  defaultDecrypt(data: string) {
    return data.split("").map((char) => {
      return String.fromCharCode(char.charCodeAt(0) - 7);
    }).join("");
  },
};

//

interface RoseJsonOptions<Data extends Record<string, any>> extends RoseDBOptions<Data> {
  /**
   * json file path.
   * - can be relative path to `process.cwd()`
   *
   */
  file: string;
  /**
   * create the file if not exists.
   *
   */
  mkfile?: boolean;
}

//

interface AsyncRoseYamlOptions<Data extends Record<string, any>> extends RoseJsonOptions<Data> {
  /**
   * serialize function.
   * @default JSON.stringify
   */
  serialize?: (data: Data) => Promise<string>;
  /**
   * deserialize function.
   * @default JSON.parse
   *
   */
  deserialize?: (data: string) => Promise<Data>;
  /**
   * encrypt data or provide custom encryption method.
   * @default false
   *
   */
  encryption?: boolean | {
    encrypt: (data: string) => Promise<string>;
    decrypt: (data: string) => Promise<string>;
  };
}

class AsyncRoseYaml<Data extends Record<string, any>> extends AsyncRoseDB<Data> {
  constructor(public options: AsyncRoseYamlOptions<Data>) {
    super();
  }

  serialize = async (data: Data) => {
    try {
      if ( this.options.serialize ) {
        return this.options.serialize(data);
      }

      return utils.defaultSerialize(data);
    } catch ( error: unknown ) {
      if ( error instanceof Error ) {
        throw new Error(`serializing failed: ${ error.message }`, {
          cause: error,
        });
      }

      throw new Error("unknown serializing error", {
        cause: error,
      });
    }
  };

  deserialize = async (data: string) => {
    try {
      if ( this.options.deserialize ) {
        return this.options.deserialize(data);
      }

      return utils.defaultDeserialize(data);
    } catch ( error: unknown ) {
      if ( error instanceof Error ) {
        throw new Error(`deserializing failed: ${ error.message }`, {
          cause: error,
        });
      }

      throw new Error("unknown deserializing error", {
        cause: error,
      });
    }
  };

  encrypt = async (data: string) => {
    try {
      const encryption = this.options.encryption;

      if ( encryption ) {
        if ( typeof encryption === "boolean" ) {
          return utils.defaultEncrypt(data);
        }

        return encryption.encrypt(data);
      }

      return data;
    } catch ( error: unknown ) {
      if ( error instanceof Error ) {
        throw new Error(`encrypting failed: ${ error.message }`, {
          cause: error,
        });
      }

      throw new Error("unknown encrypting error", {
        cause: error,
      });
    }
  };

  decrypt = async (data: string) => {
    try {
      const encryption = this.options.encryption;

      if ( encryption ) {
        if ( typeof encryption === "boolean" ) {
          return utils.defaultDecrypt(data);
        }

        return encryption.decrypt(data);
      }

      return data;
    } catch ( error: unknown ) {
      if ( error instanceof Error ) {
        throw new Error(`decrypting failed: ${ error.message }`, {
          cause: error,
        });
      }

      throw new Error("unknown decrypting error", {
        cause: error,
      });
    }
  };

  load = async () => {
    try {
      if ( !fs.existsSync(utils.resolveFile(this.options.file)) ) {
        return null;
      }

      let data = await fs.promises.readFile(utils.resolveFile(this.options.file), "utf-8");

      data = await this.decrypt(data);

      return await this.deserialize(data);
    } catch ( error: unknown ) {
      if ( error instanceof Error ) {
        throw new Error(`loading failed: ${ error.message }`, {
          cause: error,
        });
      }

      throw new Error("unknown loading error", {
        cause: error,
      });
    }
  };

  save = async (data: Data) => {
    try {
      if ( this.options.mkfile ) {
        const dir = path.dirname(utils.resolveFile(this.options.file));

        if ( !fs.existsSync(dir) ) {
          await fs.promises.mkdir(dir, {
            recursive: true,
          });
        }
      }

      const serialized = await this.serialize(data);

      const encrypted = await this.encrypt(serialized);

      await fs.promises.writeFile(utils.resolveFile(this.options.file), encrypted, "utf-8");
    } catch ( error: unknown ) {
      if ( error instanceof Error ) {
        throw new Error(`saving failed: ${ error.message }`, {
          cause: error,
        });
      }

      throw new Error("unknown saving error", {
        cause: error,
      });
    }
  };
}

//

interface SyncRoseYamlOptions<Data extends Record<string, any>> extends RoseJsonOptions<Data> {
  /**
   * serialize function.
   * @default JSON.stringify
   */
  serialize?: (data: Data) => string;
  /**
   * deserialize function.
   * @default JSON.parse
   *
   */
  deserialize?: (data: string) => Data;
  /**
   * encrypt data or provide custom encryption method.
   * @default false
   *
   */
  encryption?: boolean | {
    encrypt: (data: string) => string;
    decrypt: (data: string) => string;
  };
}

class SyncRoseYaml<Data extends Record<string, any>> extends SyncRoseDB<Data> {
  constructor(public options: SyncRoseYamlOptions<Data>) {
    super();
  }

  serialize = (data: Data) => {
    try {
      if ( this.options.serialize ) {
        return this.options.serialize(data);
      }

      return utils.defaultSerialize(data);
    } catch ( error: unknown ) {
      if ( error instanceof Error ) {
        throw new Error(`serializing failed: ${ error.message }`, {
          cause: error,
        });
      }

      throw new Error("unknown serializing error", {
        cause: error,
      });
    }
  };

  deserialize = (data: string) => {
    try {
      if ( this.options.deserialize ) {
        return this.options.deserialize(data);
      }

      return utils.defaultDeserialize(data);
    } catch ( error: unknown ) {
      if ( error instanceof Error ) {
        throw new Error(`deserializing failed: ${ error.message }`, {
          cause: error,
        });
      }

      throw new Error("unknown deserializing error", {
        cause: error,
      });
    }
  };

  encrypt = (data: string) => {
    try {
      const encryption = this.options.encryption;

      if ( encryption ) {
        if ( typeof encryption === "boolean" ) {
          return utils.defaultEncrypt(data);
        }

        return encryption.encrypt(data);
      }

      return data;
    } catch ( error: unknown ) {
      if ( error instanceof Error ) {
        throw new Error(`encrypting failed: ${ error.message }`, {
          cause: error,
        });
      }

      throw new Error("unknown encrypting error", {
        cause: error,
      });
    }
  };

  decrypt = (data: string) => {
    try {
      const encryption = this.options.encryption;

      if ( encryption ) {
        if ( typeof encryption === "boolean" ) {
          return utils.defaultDecrypt(data);
        }

        return encryption.decrypt(data);
      }

      return data;
    } catch ( error: unknown ) {
      if ( error instanceof Error ) {
        throw new Error(`decrypting failed: ${ error.message }`, {
          cause: error,
        });
      }

      throw new Error("unknown decrypting error", {
        cause: error,
      });
    }
  };

  load = () => {
    try {
      if ( !fs.existsSync(utils.resolveFile(this.options.file)) ) {
        return null;
      }

      let data = fs.readFileSync(utils.resolveFile(this.options.file), "utf-8");

      data = this.decrypt(data);

      return this.deserialize(data);
    } catch ( error: unknown ) {
      if ( error instanceof Error ) {
        throw new Error(`loading failed: ${ error.message }`, {
          cause: error,
        });
      }

      throw new Error("unknown loading error", {
        cause: error,
      });
    }
  };

  save = (data: Data) => {
    try {
      if ( this.options.mkfile ) {
        const dir = path.dirname(utils.resolveFile(this.options.file));

        if ( !fs.existsSync(dir) ) {
          fs.mkdirSync(dir, {
            recursive: true,
          });
        }
      }

      const serialized = this.serialize(data);

      const encrypted = this.encrypt(serialized);

      fs.writeFileSync(utils.resolveFile(this.options.file), encrypted, "utf-8");
    } catch ( error: unknown ) {
      if ( error instanceof Error ) {
        throw new Error(`saving failed: ${ error.message }`, {
          cause: error,
        });
      }

      throw new Error("unknown saving error", {
        cause: error,
      });
    }
  };
}

export type {
  AsyncRoseYamlOptions,
  SyncRoseYamlOptions,
};

export {
  AsyncRoseYaml,
  SyncRoseYaml,
};