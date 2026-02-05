interface Column<T> {
    key: keyof T;
    label: string;
    render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    emptyMessage?: string;
}

export function DataTable<T extends Record<string, unknown>>({
    columns,
    data,
    emptyMessage = "No data available",
}: DataTableProps<T>) {
    if (data.length === 0) {
        return (
            <div className="bg-noir-charcoal border border-noir-smoke rounded-xl p-8 text-center">
                <p className="text-noir-ash">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="bg-noir-charcoal border border-noir-smoke rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-noir-smoke">
                            {columns.map((col) => (
                                <th
                                    key={String(col.key)}
                                    className="px-4 py-3 text-left text-xs font-semibold text-noir-ash uppercase tracking-wider"
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-noir-smoke/50">
                        {data.map((row, i) => (
                            <tr key={i} className="hover:bg-noir-slate/30 transition-colors">
                                {columns.map((col) => (
                                    <td key={String(col.key)} className="px-4 py-3 text-sm text-foreground">
                                        {col.render
                                            ? col.render(row[col.key], row)
                                            : String(row[col.key] ?? "")}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
