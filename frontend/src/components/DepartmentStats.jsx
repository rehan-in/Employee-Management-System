import React from 'react';
import { BarChart3, Users, DollarSign } from 'lucide-react';

const DepartmentStats = ({ stats }) => {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 className="section-title">
        <BarChart3 size={20} color="var(--primary)" />
        Department Breakdown & Statistics
      </h2>

      <div className="dept-stats-grid">
        {stats && stats.length > 0 ? (
          stats.map((dept) => (
            <div key={dept.departmentId} className="dept-card">
              <div>
                <div className="dept-name">{dept.departmentName}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <DollarSign size={14} color="var(--accent-emerald)" />
                  Avg Salary: <strong style={{ color: 'var(--text-main)' }}>{formatCurrency(dept.avgSalary)}</strong>
                </div>
              </div>

              <div className="dept-pills">
                <span className="badge">
                  <Users size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  {dept.headcount} {dept.headcount === 1 ? 'employee' : 'employees'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel" style={{ padding: '20px', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
            No department statistics available.
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentStats;
