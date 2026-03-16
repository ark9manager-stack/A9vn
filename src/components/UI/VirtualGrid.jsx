import { FixedSizeGrid as Grid } from "react-window";

export default function VirtualGrid({
  items,
  columnCount = 6,
  itemHeight = 120,
  itemWidth = 120,
  height = 600,
  renderItem,
}) {
  const rowCount = Math.ceil(items.length / columnCount);

  return (
    <Grid
      columnCount={columnCount}
      columnWidth={itemWidth}
      height={height}
      rowCount={rowCount}
      rowHeight={itemHeight}
      width={"100%"}
    >
      {({ columnIndex, rowIndex, style }) => {
        const index = rowIndex * columnCount + columnIndex;
        const item = items[index];

        if (!item) return null;

        return <div style={style}>{renderItem(item)}</div>;
      }}
    </Grid>
  );
}
