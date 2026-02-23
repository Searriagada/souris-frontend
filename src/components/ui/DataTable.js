import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ChevronUp, ChevronDown, Loader2, AlertCircle, } from 'lucide-react';
export function DataTable({ data, columns, keyField, isLoading = false, error = null, emptyMessage = 'No hay datos disponibles', actions, }) {
    const [sortKey, setSortKey] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const handleSort = (key) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        }
        else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };
    // Filter and sort data
    let processedData = [...data];
    // Sort
    if (sortKey) {
        processedData.sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];
            if (aVal === bVal)
                return 0;
            if (aVal === null || aVal === undefined)
                return 1;
            if (bVal === null || bVal === undefined)
                return -1;
            const comparison = aVal < bVal ? -1 : 1;
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-zinc-800", children: [columns.map((column) => (_jsx("th", { className: `
                      px-6 py-4 text-left text-sm font-medium text-zinc-400
                      ${column.sortable ? 'cursor-pointer hover:text-white' : ''}
                      ${column.className || ''}
                    `, onClick: () => column.sortable && handleSort(column.key), children: _jsxs("div", { className: "flex items-center gap-2", children: [column.label, column.sortable && sortKey === column.key && (sortOrder === 'asc'
                                                        ? _jsx(ChevronUp, { className: "w-4 h-4" })
                                                        : _jsx(ChevronDown, { className: "w-4 h-4" }))] }) }, column.key))), actions && (_jsx("th", { className: "px-6 py-4 text-right text-sm font-medium text-zinc-400", children: "Acciones" }))] }) }), _jsx("tbody", { className: "divide-y divide-zinc-800", children: isLoading ? (_jsx("tr", { children: _jsx("td", { colSpan: columns.length + (actions ? 1 : 0), className: "px-6 py-12 text-center", children: _jsxs("div", { className: "flex flex-col items-center gap-3", children: [_jsx(Loader2, { className: "w-8 h-8 text-amber-500 animate-spin" }), _jsx("span", { className: "text-zinc-500", children: "Cargando..." })] }) }) })) : error ? (_jsx("tr", { children: _jsx("td", { colSpan: columns.length + (actions ? 1 : 0), className: "px-6 py-12 text-center", children: _jsxs("div", { className: "flex flex-col items-center gap-3", children: [_jsx(AlertCircle, { className: "w-8 h-8 text-red-500" }), _jsx("span", { className: "text-red-400", children: error })] }) }) })) : processedData.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: columns.length + (actions ? 1 : 0), className: "px-6 py-12 text-center text-zinc-500", children: emptyMessage }) })) : (processedData.map((item) => (_jsxs("tr", { className: "hover:bg-zinc-800/50 transition-colors", children: [columns.map((column) => (_jsx("td", { className: `px-6 py-4 text-sm text-zinc-300 ${column.className || ''}`, children: column.render
                                                ? column.render(item)
                                                : String(item[column.key] ?? '—') }, column.key))), actions && (_jsx("td", { className: "px-6 py-4 text-right", children: actions(item) }))] }, String(item[keyField]))))) })] }) }) }), !isLoading && !error && (_jsxs("p", { className: "text-sm text-zinc-500", children: [processedData.length, " de ", data.length, " registro(s)"] }))] }));
}
export default DataTable;
