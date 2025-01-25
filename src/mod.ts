import { Schema } from "effect";

export type TypeTaggedStruct<Tag extends string, Fields extends Schema.Struct.Fields> =
  Schema.Struct<
    { type: Schema.tag<Tag>; } & Fields
  >;

export function EventStruct<Tag extends string, Fields extends Schema.Struct.Fields>(
  type: Tag,
  fields: Fields,
): TypeTaggedStruct<Tag, Fields> {
  return Schema.Struct({
    type: Schema.tag(type),
    ...fields,
  });
}

export function ContextStruct<Fields extends Schema.Struct.Fields>(
  fields: Fields,
): Schema.Struct<Fields> {
  return Schema.Struct(fields);
}
