export default function DataTable({ columns = [], rows = [], getRowKey, emptyMessage = 'No records found.', className = '' }) {
  if (!rows.length) return <div className={`tj-table-empty ${className}`.trim()} role="status">{emptyMessage}</div>;
  return (
    <div className="tj-table-wrap">
      <table className={`tj-table ${className}`.trim()}>
        <thead><tr>{columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}</tr></thead>
        <tbody>{rows.map((row, index) => <tr key={getRowKey ? getRowKey(row) : row.id || row._id || index}>{columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
