import { Shapes } from "./shapes/index.ts";

const User = Shapes.object("User", {
  name: Shapes.string(),
  age: Shapes.number(),
  hasSignedIn: Shapes.boolean(),
  permissions: Shapes.optional(Shapes.array(Shapes.string())),
});

const parsed = JSON.parse(
  '{"name": "jakob", "age": 29, "hasSignedIn": true, "permissions": ["developer", "admin"]}',
);

type User = Shapes.Type<typeof User>;

if (User.checkFn(parsed)) {
  console.log(parsed);
}
