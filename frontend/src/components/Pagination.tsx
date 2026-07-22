interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-3 pt-4 text-sm">
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="btn-secondary py-1.5 disabled:cursor-not-allowed"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 010 1.06L9.06 10l3.73 3.71a.75.75 0 11-1.06 1.06l-4.25-4.25a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0z" clipRule="evenodd" />
        </svg>
        Prev
      </button>
      <span className="font-medium text-slate-600">
        Page {page} of {totalPages}
      </span>
      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="btn-secondary py-1.5 disabled:cursor-not-allowed"
      >
        Next
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 010-1.06L10.94 10 7.21 6.29a.75.75 0 111.06-1.06l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}
