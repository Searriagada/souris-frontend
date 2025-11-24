interface StatusBadgeProps {
  status: 'activo' | 'inactivo' | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isActive = status === 'activo';

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        ${isActive
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
        }
      `}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-zinc-400'}`}
      />
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  );
}

export default StatusBadge;
