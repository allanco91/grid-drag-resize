export type MouseEventType = "move" | "resize";

export type Settings = {
  event: MouseEventType | null;
  mouseDown: { x: number; y: number };
  initial: { x: number; y: number; height: number; width: number };
};

export type Item = {
  id: number;
  x: number;
  y: number;
  color: string;
  height: number;
  width: number;
  col: { start: number; end: number };
  row: { start: number; end: number };
};

export type Grid = {
  cols: number;
  rows: number;
  gap: number;
  colWidth: number;
  rowHeight: number;
}