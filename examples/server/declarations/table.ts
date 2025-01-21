export interface Column<T> {
  type: string;
}

export interface Table<Columns extends Record<string, Column<any>>> {
  id: string;
  columns: Columns;
}

export type InferColumnType<TColumn extends Column<any>> =
  TColumn extends Column<infer T> ? T : never;

export type InferRowType<TTable extends Table<any>> = {
  [K in keyof TTable["columns"]]: InferColumnType<TTable["columns"][K]>;
};

function _column<T>(type: string): Column<T> {
  return {
    type,
  };
}

export function string() {
  return _column<string>("string");
}

export function number() {
  return _column<number>("number");
}

export function boolean() {
  return _column<boolean>("boolean");
}

export function array<T>() {
  return _column<T[]>("array");
}

export function object<T extends Record<string, any>>() {
  return _column<T>("object");
}

export function table<Columns extends Record<string, Column<any>>>(
  id: string,
  columns: Columns
): Table<Columns> {
  return {
    id,
    columns,
  };
}
