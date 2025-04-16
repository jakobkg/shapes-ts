import { assert } from "@std/assert";
import { Shapes } from "./shapes/index.ts";
import { assertEquals } from "@std/assert/equals";
import { assertFalse } from "@std/assert/false";

Deno.test(function Primitives() {
  // JSON strings
  const jsonStr = '"test string"';
  const jsonNum = "100";
  const jsonBool = "false";
  const jsonObj = '{"foo": "bar"}';
  const jsonArr = "[0]";
  const jsonOptional = "null";

  // Shapes
  const strShape = Shapes.string();
  const numShape = Shapes.number();
  const boolShape = Shapes.boolean();
  const objShape = Shapes.object({
    foo: Shapes.string(),
  });
  const arrShape = Shapes.array(Shapes.number());
  const optShape = Shapes.nullable(Shapes.number());

  const shapes = [strShape, numShape, boolShape, objShape, arrShape, optShape];

  // Parse
  const str = JSON.parse(jsonStr);
  const num = JSON.parse(jsonNum);
  const bool = JSON.parse(jsonBool);
  const obj = JSON.parse(jsonObj);
  const arr = JSON.parse(jsonArr);
  const opt = JSON.parse(jsonOptional);

  const parsed = [str, num, bool, obj, arr, opt];

  // Check positive cases
  assert(strShape.checkFn(str), "Type check of string failed");
  assert(numShape.checkFn(num), "Type check of number failed");
  assert(boolShape.checkFn(bool), "Type check of boolean failed");
  assert(objShape.checkFn(obj), "Type check of object failed");
  assert(arrShape.checkFn(arr), "Type check of array failed");
  assert(
    optShape.checkFn(opt),
    "Type check of nullable value failed when value is null",
  );
  assert(
    optShape.checkFn(num),
    "Type check of nullable value failed when value is present",
  );

  // Each shape should only pass checking on one of the parsed values
  shapes.forEach((shape) => {
    const numPassed = parsed.map((value) =>
      shape.checkFn(value)
    ).filter((checkPassed) => checkPassed).length;

    assertEquals(
      numPassed,
      // Shape for nullable value should match a value and null, all others should only match their precise values
      shape === optShape ? 2 : 1,
      `Failed on Shape ${shape.typename}. ` +
        `Should only have pased its corresponding values, but passed on ${numPassed} values`,
    );
  });
});

Deno.test(function Objects() {
  // JSON strings
  const validJsonUser =
    '{"name": "jakob", "id": 72937123, "age": null, "admin": false, "groups": ["g:182893174", "g:73645823"]}';
  const jsonUserMissingField =
    '{"name": "jakob", "id": 72937123, "age": null, "groups": ["g:182893174", "g:73645823"]}';
  const jsonUserWrongTypeOnId =
    '{"name": "jakob", "id": "72937123", "age": null, "admin": false, "groups": ["g:182893174", "g:73645823"]}';
  const jsonUserUnexpectedNull =
    '{"name": "jakob", "id": 72937123, "age": null, "admin": false, "groups": null}';
  const jsonUserExtraField =
    '{"name": "jakob", "id": 72937123, "age": null, "admin": false, "groups": ["g:182893174", "g:73645823"], "lastSignedIn": 1744793026}';
  const jsonString = '"jakob"';

  // Parse them to get a bunch of `any`s
  const validUser = JSON.parse(validJsonUser);
  const userMissingField = JSON.parse(jsonUserMissingField);
  const userWithStringId = JSON.parse(jsonUserWrongTypeOnId);
  const userWithUnexpectedNull = JSON.parse(jsonUserUnexpectedNull);
  const userWithExtraField = JSON.parse(jsonUserExtraField);
  const nonObjectString = JSON.parse(jsonString);

  // Shape for the User type
  const UserShape = Shapes.object("User", {
    name: Shapes.string(),
    id: Shapes.number(),
    age: Shapes.nullable(Shapes.number()),
    admin: Shapes.boolean(),
    groups: Shapes.array(Shapes.string()),
  });

  // Do the things
  assert(UserShape.checkFn(validUser));
  assertFalse(UserShape.checkFn(userMissingField));
  assertFalse(UserShape.checkFn(userWithStringId));
  assertFalse(UserShape.checkFn(userWithUnexpectedNull));
  assertFalse(UserShape.checkFn(userWithExtraField));
  assertFalse(UserShape.checkFn(nonObjectString));
});

Deno.test(function Arrays() {
  const simpleStringArrayJson = '["a", "b", "c"]';
  const nullableStringArrayJson = '["a", "b", null, "c"]';
  const nullableStringArrayWithNumberJson = '["a", "b", null, "c", 99.543]';
  const emptyArrayJson = "[]";
  const objectsArrayJson =
    '[{"foo": "bar", "baz": 100}, {"foo": "bar", "baz": 100}]';

  const stringArray = JSON.parse(simpleStringArrayJson);
  const nullableStringArray = JSON.parse(nullableStringArrayJson);
  const nullableStringArrayWithNumber = JSON.parse(
    nullableStringArrayWithNumberJson,
  );
  const emptyArray = JSON.parse(emptyArrayJson);
  const objectsArray = JSON.parse(objectsArrayJson);

  const StringArrayShape = Shapes.array(Shapes.string());
  const NullableStringArrayShape = Shapes.array(
    Shapes.nullable(Shapes.string()),
  );

  const ObjectShape = Shapes.object({
    foo: Shapes.string(),
    baz: Shapes.number(),
  });
  const ObjectsArrayShape = Shapes.array(ObjectShape);

  assert(StringArrayShape.checkFn(stringArray));
  assert(StringArrayShape.checkFn(emptyArray));

  assertFalse(StringArrayShape.checkFn(nullableStringArray));
  assert(NullableStringArrayShape.checkFn(nullableStringArray));
  assertFalse(NullableStringArrayShape.checkFn(nullableStringArrayWithNumber));

  assert(ObjectsArrayShape.checkFn(emptyArray));
  assert(ObjectsArrayShape.checkFn(objectsArray));
});
