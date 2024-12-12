import { CSSProperties, useEffect, useRef, useState } from "react";
import { Grid, Item, MouseEventType, Settings } from "./types";

import { TbGridDots } from "react-icons/tb";

interface IDashItemProps {
  item: Item;
  items: Item[];
  grid: Grid;
  onChange: (item: Item) => void;
}

const reseted_settings: Settings = {
  event: null,
  mouseDown: {
    x: 0,
    y: 0,
  },
  initial: {
    x: 0,
    y: 0,
    height: 0,
    width: 0,
  },
};

export function DashItem({ item, items, grid, onChange }: IDashItemProps) {
  const ref_item = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<Settings>(
    structuredClone(reseted_settings)
  );

  const [cursor, setCursor] = useState<CSSProperties["cursor"]>("default");

  useEffect(() => {
    document.body.style.cursor = cursor as string;
  }, [cursor]);

  useEffect(() => {
    if (!settings.event) return;

    window.addEventListener("mouseup", end);
    window.addEventListener("mousemove", handleOnMouseMove);

    return () => {
      window.removeEventListener("mouseup", end);
      window.removeEventListener("mousemove", handleOnMouseMove);
    };
  }, [settings, item]);

  function handleOnMouseMove(event: MouseEvent) {
    switch (settings.event) {
      case "move":
        move(event);
        break;
      case "resize":
        resize(event);
        break;
      default:
        // do nothing;
        break;
    }
  }

  function start(
    eventType: MouseEventType,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) {
    setSettings({
      event: eventType,
      mouseDown: {
        x: event.pageX,
        y: event.pageY,
      },
      initial: {
        x: item.x,
        y: item.y,
        height: item.height,
        width: item.width,
      },
    });
  }

  function end() {
    setCursor("default");

    const calculated_item = calcItem(item.width, item.height);

    if (settings.event === "resize") {
      if (!intersects(item, item.width, item.height, item.x, item.y)) {
        onChange(calculated_item);
      } else {
        onChange({
          ...item,
          height: settings.initial.height,
          width: settings.initial.width,
        });
      }
    }

    if (settings.event === "move") {
      if (!intersects(item, item.width, item.height, item.x, item.y)) {
        onChange(calculated_item);
      } else {
        onChange({ ...item, x: settings.initial.x, y: settings.initial.y });
      }
    }

    setSettings(structuredClone(reseted_settings));
  }

  function calcItem(newWidth: number, newHeight: number): Item {
    const cols = Math.round(newWidth / grid.colWidth);
    const width = cols * grid.colWidth;

    const rows = Math.round(newHeight / grid.rowHeight);
    const height = rows * grid.rowHeight;

    const { position: x, start: colstart } = calcSnap(item.x, grid.colWidth);
    const { position: y, start: rowstart } = calcSnap(item.y, grid.rowHeight);

    return {
      ...item,
      x: x,
      y: y,
      width: width + (cols - 1) * grid.gap,
      height: height + (rows - 1) * grid.gap,
      col: { start: colstart, end: colstart + cols },
      row: { start: rowstart, end: rowstart + rows },
    };
  }

  function calcSnap(position: number, size: number) {
    const units = position / size;

    const start = Math.ceil(units);
    const position_gap = start > 0 ? (start - 1) * grid.gap : 0;

    return { position: Math.floor(units) * size + position_gap, start: start };
  }

  function intersects(
    current: Item,
    width: number,
    height: number,
    x: number,
    y: number
  ) {
    const verify = items.filter((item) => item.id !== current.id);

    return verify.find(
      (v) =>
        x + width >= (v.col.start - 1) * grid.gap + v.x &&
        (current.col.start - 1) * grid.gap + x <= v.x + v.width &&
        y + height >= (v.row.start - 1) * grid.gap + v.y &&
        (current.row.start - 1) * grid.gap + y <= v.y + v.height
    );
  }

  function resize(event: MouseEvent) {
    let width = settings.initial!.width + event.pageX - settings.mouseDown?.x!;
    let height =
      settings.initial!.height + event.pageY - settings.mouseDown?.y!;

    const max_w =
      (grid.cols - item.col.start) * grid.gap +
      (item.col.start > 0 ? grid.cols - item.col.start + 1 : grid.cols) *
        grid.colWidth;

    const max_h =
      (grid.rows - item.row.start) * grid.gap +
      (item.row.start > 0 ? grid.rows - item.row.start + 1 : grid.rows) *
        grid.rowHeight;

    if (width < grid.colWidth) {
      width = grid.colWidth;
    }

    if (width > max_w) {
      width = max_w;
    }

    if (height < grid.rowHeight) {
      height = grid.rowHeight;
    }

    if (height > max_h) {
      height = max_h;
    }

    if (intersects(item, item.width, item.height, item.x, item.y)) {
      setCursor("not-allowed");
    } else {
      setCursor("se-resize");
    }

    onChange({
      ...item,
      width: width,
      height: height,
    });
  }

  function move(event: MouseEvent) {
    const offset_x = event.pageX - settings.mouseDown.x;
    const offset_y = event.pageY - settings.mouseDown.y;

    let x = offset_x + item.x;
    let y = offset_y + item.y;

    const max_w =
      (grid.cols - 1) * grid.gap + grid.cols * grid.colWidth - item.width;

    const max_h =
      (grid.rows - 1) * grid.gap + grid.rows * grid.rowHeight - item.height;

    if (x < 0) {
      x = 0;
    }

    if (y < 0) {
      y = 0;
    }

    if (x > max_w) {
      x = max_w;
    }

    if (y > max_h) {
      y = max_h;
    }

    if (intersects(item, item.width, item.height, x, y)) {
      setCursor("not-allowed");
    } else {
      setCursor("grabbing");
    }

    onChange({
      ...item,
      x: x,
      y: y,
    });

    setSettings((prev) => ({
      ...prev,
      mouseDown: { x: event.pageX, y: event.pageY },
    }));
  }

  function handleOnMouseEnterMove() {
    setCursor("grab");
  }

  function handleOnMouseEnterResize() {
    setCursor("se-resize");
  }

  function handleOnMouseLeaveHandler() {
    setCursor("default");
  }

  return (
    <div
      ref={ref_item}
      className="grid-item"
      style={
        {
          backgroundColor: item.color,
          height: item.height,
          width: item.width,
          top: item.y,
          left: item.x,
          zIndex: settings.event !== null ? "1000" : "1",
        } as CSSProperties
      }
    >
      <div className="move">
        <div
          className="handler"
          onMouseOver={handleOnMouseEnterMove}
          onMouseOut={handleOnMouseLeaveHandler}
          onMouseDown={(event) => start("move", event)}
        >
          <TbGridDots size={20} color="#1f1c2c" />
        </div>
      </div>
      <div
        className="resize-handler"
        onMouseOver={handleOnMouseEnterResize}
        onMouseOut={handleOnMouseLeaveHandler}
        onMouseDown={(event) => start("resize", event)}
      />
    </div>
  );
}
