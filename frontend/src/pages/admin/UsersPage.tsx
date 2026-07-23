import React, { useState } from 'react';
import { useUsers } from '../../hooks/useAdminQuery';
import type { UserResponse } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 10;

const UsersPage: React.FC = () => {
  const { data: users = [], isLoading } = useUsers();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const filtered = users.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const columns: Column<UserResponse>[] = [
    {
      header: 'Name',
      accessor: (u) => <span className="font-medium text-slate-900">{u.fullName}</span>,
    },
    {
      header: 'Email',
      accessor: (u) => <span className="text-slate-500">{u.email}</span>,
    },
    {
      header: 'Role',
      accessor: (u) => <Badge variant="neutral">{u.role.replace('ROLE_', '')}</Badge>,
    },
    {
      header: 'Status',
      accessor: (u) => u.active ? <Badge variant="success" dot>Active</Badge> : <Badge variant="danger" dot>Inactive</Badge>,
    },
    {
      header: '',
      accessor: (u) => u.role === 'ROLE_PATIENT' ? (
        <Link to={`/admin/patients/${u.id}/records`}>
          <Button variant="ghost" size="sm">View Records</Button>
        </Link>
      ) : null,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Users</h1>
          <p className="text-sm text-slate-500 mt-1">{users.length} total accounts</p>
        </div>
        <input
          type="text"
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 w-full sm:w-60"
          placeholder="Search users..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={paged} keyExtractor={(u) => u.id} loading={isLoading} emptyMessage="No users found." />
      </div>

      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-sm text-slate-500">
            Showing {(safePage * PAGE_SIZE) + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" disabled={safePage === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${i === safePage ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {i + 1}
              </button>
            ))}
            <Button variant="secondary" size="sm" disabled={safePage >= totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
