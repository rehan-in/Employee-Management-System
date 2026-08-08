import React from 'react';
import { Search, Filter, Plus, Edit, Trash2, Mail, Phone, Building } from 'lucide-react';

const EmployeeTable = ({
  employees,
  departments,
  searchTerm,
  setSearchTerm,
  selectedDepartment,
  setSelectedDepartment,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee
}) => {

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  const getInitials = (name) => {
    if (!name) return 'E';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {/* Controls Header */}
      <div className="controls-bar">
        <div className="search-filter-group">
          {/* Search by Name */}
          <div className="input-wrapper">
            <Search size={18} className="input-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Search employee by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter by Department ID */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
            <Filter size={18} color="var(--text-muted)" />
            <select
              className="form-select"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.department_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Add Employee Action */}
        <button className="btn btn-primary" onClick={onAddEmployee}>
          <Plus size={18} />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Contact Info</th>
              <th>Department</th>
              <th>Annual Salary</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees && employees.length > 0 ? (
              employees.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div className="emp-name-cell">
                      <div className="avatar-circle">
                        {getInitials(emp.name)}
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-main)', fontWeight: '600' }}>{emp.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>ID: #{emp.id}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                        <Mail size={13} color="var(--accent-cyan)" />
                        {emp.email}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                        <Phone size={13} color="var(--primary)" />
                        {emp.phone}
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Building size={12} />
                      {emp.department_name || 'General'}
                    </span>
                  </td>

                  <td style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                    {formatCurrency(emp.salary)}
                  </td>

                  <td>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary btn-icon"
                        onClick={() => onEditEmployee(emp)}
                        title="Edit Employee"
                      >
                        <Edit size={16} color="var(--accent-cyan)" />
                      </button>
                      <button
                        className="btn btn-danger btn-icon"
                        onClick={() => onDeleteEmployee(emp)}
                        title="Delete Employee"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No employees found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTable;
