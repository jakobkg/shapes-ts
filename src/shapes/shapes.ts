// Primitive checkers
// These are static functions so that Shapes can reference them,
// rather than having each Shape instance allocate its own instance
// of an arrow function

function isString(input: unknown): input is string {
  return typeof input === "string";
}

function isNumber(input: unknown): input is number {
  return Number.isFinite(input);
}

function isObject(input: unknown): input is object {
  return input !== null && typeof input === "object" && !Array.isArray(input);
}

function isArray(input: unknown): input is unknown[] {
  return Array.isArray(input);
}

function isNull(input: unknown): input is null {
  return input === null;
}

function isBoolean(input: unknown): input is boolean {
  return typeof input === "boolean";
}

function isUndefined(input: unknown): input is undefined {
  return input === undefined;
}

// Shapes
// These are wrappers for data validation logic that can be mapped down to actual TS types.
// They do not actually hold the data to be checked, so we avoid allocating an extra copy of the input data!
interface TypeShape {
  typename: string;
  checkFn: (x: unknown) => x is this["primitive"];
  primitive: unknown;
  optional: boolean;
}

interface NumberShape extends TypeShape {
  primitive: number;
}

interface StringShape extends TypeShape {
  primitive: string;
}

interface BooleanShape extends TypeShape {
  primitive: boolean;
}

interface ObjectShape<T extends ObjectProperties = ObjectProperties>
  extends TypeShape {
  primitive: ObjectType<T>;
  properties: T;
}

interface OptionalShape<T extends TypeShape> extends TypeShape {
  inner: T;
  primitive: this["inner"]["primitive"] | undefined;
}

interface NullableShape<T extends TypeShape> extends TypeShape {
  inner: T;
  primitive: this["inner"]["primitive"] | null;
}

interface ArrayShape<T extends TypeShape> extends TypeShape {
  members: T;
  primitive: Array<this["members"]["primitive"]>;
}

// Shape builders? Not sure what to call these, but you can compose these to describe
// the expected shape of some data, and get a composite type predicate for free, allowing you to confirm
// that the shape of the data is correct at runtime
//
// The builders are mostly very simple, but the type predicates of more complex types can be a little daunting.
//

export function optional<T extends TypeShape>(shape: T): OptionalShape<T> {
  return {
    typename: `${shape.typename} | undefined`,
    checkFn: (input: unknown): input is T["primitive"] | undefined =>
      isUndefined(input) || shape["checkFn"](input),
    inner: shape,
    optional: true,
  } as never;
}

export function nullable<T extends TypeShape>(shape: T): NullableShape<T> {
  return {
    typename: `${shape.typename} | null`,
    checkFn: (input: unknown): input is T["primitive"] | null =>
      isNull(input) || shape["checkFn"](input),
    inner: shape,
  } as never;
}

export function number(): NumberShape {
  return {
    typename: "number",
    checkFn: isNumber,
  } as never;
}

export function string(): StringShape {
  return {
    typename: "string",
    checkFn: isString,
  } as never;
}

export function boolean(): BooleanShape {
  return {
    typename: "boolean",
    checkFn: isBoolean,
  } as never;
}

export function array<T extends TypeShape>(shape: T): ArrayShape<T> {
  const typename = `Array<${shape.typename}>`;

  return {
    typename: typename,
    members: shape,
    checkFn: (input: unknown): input is Array<T["primitive"]> => {
      // Check that input is an array
      if (!isArray(input)) {
        console.warn(`Checking ${typename} failed, input was not an array`);
        return false;
      }

      // Check that every element in the array is of the expected type
      return input.every((entry: unknown) => {
        if (!shape.checkFn(entry)) {
          console.warn(
            `Checking ${typename} failed due to element with value "${entry}" (type ${typeof entry}) ` +
              `when type ${shape.typename} was expected`,
          );
          return false;
        }

        return true;
      });
    },
  } as never;
}

export function object<T extends ObjectProperties>(
  properties: T,
): ObjectShape<T>;
export function object<T extends ObjectProperties>(
  name: string,
  properties: T,
): ObjectShape<T>;
export function object<T extends ObjectProperties>(
  nameOrProps: string | T,
  maybeProperties?: T,
): ObjectShape<T> {
  // Type wrangling to support named and unnamed object types
  let name: string | undefined;
  let properties: T;

  if (typeof nameOrProps === "string") {
    if (maybeProperties !== undefined) {
      name = nameOrProps;
      properties = maybeProperties;
    } else {
      throw new Error("Bad arguments somehow");
    }
  } else {
    properties = nameOrProps;
  }

  const typename = name === undefined ? "Object" : name;

  return {
    typename: typename,
    checkFn: (input: unknown): input is Type<ObjectShape<T>> => {
      // Check that input is an object
      if (!isObject(input)) {
        console.warn(`Checking ${typename} failed, input was not an object`);
        return false;
      }

      // Check that all properties on input object are registered on the Object shape
      for (const inputProperty in input) {
        if (!(inputProperty in properties)) {
          console.warn(
            `Checking ${typename} failed due to unknown property ${inputProperty} in input data`,
          );
          return false;
        }
      }

      // Check that all registered properties on the Object shape are present in the input data, and are of expected type
      for (const property in properties) {
        const field =
          (input as { [property: string | number]: unknown })[property];

        // Property presence check
        if (!(property in input) && !properties[property].optional) {
          console.warn(
            `Checking ${typename} failed due to missing property "${property}" (type ${
              properties[property].typename
            })`,
          );
          return false;
        }

        // Property type check
        if (!properties[property].checkFn(field)) {
          console.warn(
            `Checking ${typename} failed on property "${property}" with value "${field}" (type ${typeof field}), ` +
              `where type ${properties[property].typename} was expected`,
          );
          return false;
        }
      }

      return true;
    },
    properties,
  } as never;
}

// Helpers for Object shapes to more concisely describe their properties
// and derive their TS native types since the primitive Object is not very useful
type ObjectType<T extends ObjectProperties> = { [K in keyof T]: Type<T[K]> };
type ObjectProperties = Record<string | number, TypeShape>;

/**
 * Bridge to convert a shape into a TS type.
 *
 * @example
 *
 * const User = Shapes.object("User", {
 *   name: Shapes.string(),
 *   age: Shapes.number(),
 *   hasSignedIn: Shapes.boolean(),
 *   permissions: Shapes.optional(Shapes.array(Shapes.string())),
 * });
 *
 * type User = Shape.Type<typeof User>;
 * // Equivalent to
 * // type User = {
 * // name: string,
 * // age: number,
 * // hasSignedIn: boolean,
 * // permissions: string[] | null
 * // }
 */
export type Type<T extends TypeShape, Result = T["primitive"]> = Result;
