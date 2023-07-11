import { AsyncRoseCson } from "@rosedb/cson";

interface Data {
  users: string[];
}

const data: Data = {
  users: [ "user1", "user2", "user3" ],
};

const db = new AsyncRoseCson<Data>({
  // default value
  default: data,
  // file name
  file: "data.json",
  // create file if not exists
  mkfile: true,
});

await db.init();

db.set("users", [ "user4", "user5", "user6" ]);
const users = db.get("users")!;
console.log(users);
// [ "user4", "user5", "user6" ]