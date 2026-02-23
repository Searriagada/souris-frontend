import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function StatusBadge({ status }) {
    const isActive = status === 'activo';
    return (_jsxs("span", { className: `
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        ${isActive
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'}
      `, children: [_jsx("span", { className: `w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-zinc-400'}` }), isActive ? 'Publicado' : 'Pendiente'] }));
}
export default StatusBadge;
