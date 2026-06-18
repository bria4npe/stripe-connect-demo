"use client";

import { useState, useMemo, useRef, useEffect } from "react";

type TransferStatus =
  | "succeeded"
  | "refunded"
  | "incomplete"
  | "succeeded_no_transfer";

type Transfer = {
  id: string;
  amount: number;
  currency: string;
  destId: string;
  destName: string;
  created: number;
  totalAmount: number;
  feeAmount: number;
  status: TransferStatus;
};

type SortKey = "created" | "totalAmount" | "amount" | "feeAmount" | "destName";
type SortDir = "asc" | "desc";

const STATUS_CONFIG: Record<
  TransferStatus,
  { label: string; classes: string }
> = {
  succeeded: { label: "✓ Completada", classes: "bg-green-100 text-green-700" },
  refunded: {
    label: "↩ Reembolsada",
    classes: "bg-orange-100 text-orange-700",
  },
  incomplete: {
    label: "⏳ Incompleta",
    classes: "bg-yellow-100 text-yellow-700",
  },
  succeeded_no_transfer: {
    label: "✓ Sin split",
    classes: "bg-blue-100 text-blue-700",
  },
};

const PAGE_SIZE = 10;

const ALL_STATUSES: TransferStatus[] = ["succeeded", "refunded", "incomplete"];

const STATUS_LABELS: Record<TransferStatus, string> = {
  succeeded: "Completada",
  refunded: "Reembolsada",
  incomplete: "Incompleta",
  succeeded_no_transfer: "Sin split",
};

function StatusDropdown({
  selected,
  onChange,
}: {
  selected: TransferStatus[];
  onChange: (v: TransferStatus[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggle(s: TransferStatus) {
    onChange(
      selected.includes(s) ? selected.filter((x) => x !== s) : [...selected, s],
    );
  }

  const label =
    selected.length === 0 || selected.length === ALL_STATUSES.length
      ? "Todos los estados"
      : selected.map((s) => STATUS_LABELS[s]).join(", ");

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white flex items-center gap-2 min-w-[170px]"
      >
        <span className="truncate max-w-[160px]">{label}</span>
        <span className="ml-auto text-gray-400">▾</span>
      </button>
      {open && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[170px]">
          {ALL_STATUSES.map((s) => (
            <label
              key={s}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={selected.includes(s)}
                onChange={() => toggle(s)}
                className="accent-indigo-600"
              />
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CONFIG[s].classes}`}
              >
                {STATUS_CONFIG[s].label}
              </span>
            </label>
          ))}
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-gray-600 border-t border-gray-100"
            >
              Limpiar selección
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span
      className="inline-flex flex-col ml-1 opacity-40"
      style={{ fontSize: 8, lineHeight: 1 }}
    >
      <span style={{ opacity: active && dir === "asc" ? 1 : 0.4 }}>▲</span>
      <span style={{ opacity: active && dir === "desc" ? 1 : 0.4 }}>▼</span>
    </span>
  );
}

export default function TransfersTable({
  transfers,
}: {
  transfers: Transfer[];
}) {
  const [filterVendor, setFilterVendor] = useState("all");
  const [filterStatuses, setFilterStatuses] = useState<TransferStatus[]>([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const vendors = Array.from(
    new Set(transfers.map((t) => t.destName).filter((n) => n !== "—")),
  );

  const filtered = useMemo(() => {
    const base = transfers.filter((t) => {
      const matchVendor = filterVendor === "all" || t.destName === filterVendor;
      const matchStatus =
        filterStatuses.length === 0 || filterStatuses.includes(t.status);
      const matchSearch =
        search === "" ||
        t.destName.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase());
      return matchVendor && matchStatus && matchSearch;
    });

    return [...base].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [transfers, filterVendor, filterStatuses, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const splitRows = filtered.filter(
    (t) => t.status === "succeeded" || t.status === "refunded",
  );
  const filteredTotal = splitRows.reduce((sum, t) => sum + t.totalAmount, 0);
  const filteredVendorTotal = splitRows.reduce((sum, t) => sum + t.amount, 0);
  const filteredFeeTotal = splitRows.reduce((sum, t) => sum + t.feeAmount, 0);

  const hasFilters =
    filterVendor !== "all" || filterStatuses.length > 0 || search !== "";

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  }

  function handleFilterChange(fn: () => void) {
    fn();
    setPage(1);
  }

  const thClass =
    "text-left px-5 py-3 font-medium text-gray-600 cursor-pointer select-none hover:text-gray-900 whitespace-nowrap";

  return (
    <div>
      {/* Filtros */}
      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <input
          type="text"
          placeholder="Buscar por vendedor o ID..."
          value={search}
          onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
        />
        <select
          value={filterVendor}
          onChange={(e) =>
            handleFilterChange(() => setFilterVendor(e.target.value))
          }
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Todos los vendedores</option>
          {vendors.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <StatusDropdown
          selected={filterStatuses}
          onChange={(v) => handleFilterChange(() => setFilterStatuses(v))}
        />
        {hasFilters && (
          <button
            onClick={() =>
              handleFilterChange(() => {
                setFilterVendor("all");
                setFilterStatuses([]);
                setSearch("");
              })
            }
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Limpiar filtros
          </button>
        )}
        <span className="text-sm text-gray-400">
          {filtered.length} de {transfers.length} transacciones
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No hay transacciones que coincidan con el filtro.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">
                    #
                  </th>
                  <th
                    className={thClass}
                    onClick={() => toggleSort("destName")}
                  >
                    Vendedor{" "}
                    <SortIcon active={sortKey === "destName"} dir={sortDir} />
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">
                    Estado
                  </th>
                  <th className={thClass} onClick={() => toggleSort("created")}>
                    Fecha{" "}
                    <SortIcon active={sortKey === "created"} dir={sortDir} />
                  </th>
                  <th
                    className={thClass}
                    onClick={() => toggleSort("totalAmount")}
                  >
                    Total cobrado{" "}
                    <SortIcon
                      active={sortKey === "totalAmount"}
                      dir={sortDir}
                    />
                  </th>
                  <th className={thClass} onClick={() => toggleSort("amount")}>
                    Vendedor recibe (90%){" "}
                    <SortIcon active={sortKey === "amount"} dir={sortDir} />
                  </th>
                  <th
                    className={thClass}
                    onClick={() => toggleSort("feeAmount")}
                  >
                    Comisión Beli (10%){" "}
                    <SortIcon active={sortKey === "feeAmount"} dir={sortDir} />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((transfer, i) => {
                  const s = STATUS_CONFIG[transfer.status];
                  const isIncomplete =
                    transfer.status === "incomplete" ||
                    transfer.status === "succeeded_no_transfer";
                  const globalIndex = (currentPage - 1) * PAGE_SIZE + i + 1;
                  return (
                    <tr key={transfer.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-400 text-xs font-mono">
                        {globalIndex}
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-900">
                        {transfer.destName}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.classes}`}
                        >
                          {s.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(transfer.created * 1000).toLocaleDateString(
                          "es-PE",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-900">
                        {isIncomplete ? (
                          <span className="text-gray-400">
                            ${(transfer.totalAmount / 100).toFixed(2)}
                          </span>
                        ) : (
                          `$${(transfer.totalAmount / 100).toFixed(2)}`
                        )}
                      </td>
                      <td className="px-5 py-3 font-medium">
                        {isIncomplete ? (
                          <span className="text-gray-300">—</span>
                        ) : (
                          <span className="text-green-600">
                            ${(transfer.amount / 100).toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 font-medium">
                        {isIncomplete ? (
                          <span className="text-gray-300">—</span>
                        ) : (
                          <span className="text-indigo-600">
                            ${(transfer.feeAmount / 100).toFixed(2)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td
                    className="px-5 py-3 font-semibold text-gray-700"
                    colSpan={4}
                  >
                    Total ({splitRows.length} transferencias)
                  </td>
                  <td className="px-5 py-3 font-semibold text-gray-900">
                    ${(filteredTotal / 100).toFixed(2)}
                  </td>
                  <td className="px-5 py-3 font-semibold text-green-600">
                    ${(filteredVendorTotal / 100).toFixed(2)}
                  </td>
                  <td className="px-5 py-3 font-semibold text-indigo-600">
                    ${(filteredFeeTotal / 100).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-500">
                Página {currentPage} de {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  ← Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-1.5 text-sm border rounded-lg ${
                        p === currentPage
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
