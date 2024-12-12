import "./App.css";
import { Grid, Item } from "./types";
import { DashItem } from "./dash-item";
import { useEffect, useRef, useState } from "react";

function App() {
  const ref_gridcell = useRef<HTMLDivElement>(null);

  const [grid, setGrid] = useState<Grid>({
    cols: 7,
    rows: 6,
    gap: 10,
    colWidth: 0,
    rowHeight: 0,
  });

  const [items, setItems] = useState<Item[]>([
    {
      id: 1,
      x: 0,
      y: 0,
      height: 0,
      width: 0,
      color: "#08ffbd",
      col: { start: 1, end: 4 },
      row: { start: 1, end: 4 },
    },
    {
      id: 2,
      x: 0,
      y: 0,
      height: 0,
      width: 0,
      color: "#0873ff",
      col: { start: 4, end: 5 },
      row: { start: 4, end: 6 },
    },
    {
      id: 3,
      x: 0,
      y: 0,
      height: 0,
      width: 0,
      color: "#EFB6C8",
      col: { start: 5, end: 6 },
      row: { start: 4, end: 6 },
    },
  ]);

  function handleOnChangeItem(item: Item) {
    const newitems = [...items];
    const index = newitems.findIndex((i) => i.id === item.id);

    if (index > -1) {
      newitems.splice(index, 1, item);
    }

    setItems(newitems);
  }

  useEffect(() => {
    handleOnResizeWindow();

    window.addEventListener("resize", handleOnResizeWindow);

    return () => {
      window.removeEventListener("resize", handleOnResizeWindow);
    };
  }, []);

  useEffect(() => {
    handleOnCalcSize();
  }, [grid]);

  function handleOnResizeWindow() {
    const width = ref_gridcell.current?.clientWidth ?? 0;
    const height = ref_gridcell.current?.clientHeight ?? 0;

    setGrid((prev) => ({ ...prev, colWidth: width, rowHeight: height }));
  }

  function handleOnCalcSize() {
    const grid_items = [...items];

    for (const item of grid_items) {
      const cols = item.col.end - item.col.start;
      const rows = item.row.end - item.row.start;

      const x_gap = (item.col.start -1) * grid.gap;
      const y_gap = (item.row.start -1) * grid.gap;

      item.x = (item.col.start - 1) * grid.colWidth + x_gap;
      item.y = (item.row.start - 1) * grid.rowHeight + y_gap;
      item.height = rows * grid.rowHeight + (rows - 1) * grid.gap;
      item.width = cols * grid.colWidth + (cols - 1) * grid.gap;
    }

    setItems(grid_items);
  }

  return (
    <>
      <div className="container">
        <div
          ref={ref_gridcell}
          className="item-hidden"
          style={{
            gridColumnStart: 1,
            gridColumnEnd: 2,
            gridRowStart: 1,
            gridRowEnd: 2,
          }}
        />
        {Array.from({ length: grid.cols }).map((_, col) =>
          Array.from({ length: grid.rows }).map((_, row) => (
            <div
              key={`grid_col_${col + 1}_row_${row + 1}`}
              id={`grid_col_${col + 1}_row_${row + 1}`}
              style={{
                gridColumnStart: col + 1,
                gridColumnEnd: col + 1,
                gridRowStart: row + 1,
                gridRowEnd: row + 1,
              }}
              className="item"
            />
          ))
        )}
        {items.map((item) => (
          <DashItem
            key={item.id}
            item={item}
            items={items}
            onChange={handleOnChangeItem}
            grid={grid}
          />
        ))}
      </div>
    </>
  );
}

export default App;
