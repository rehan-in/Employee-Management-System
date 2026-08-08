import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import MetricsCards from '../components/MetricsCards';
import DepartmentStats from '../components/DepartmentStats';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeModal from '../components/EmployeeModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const DashboardPage = () => {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [deptStats, setDeptStats] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const getHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  }, [token]);

  // Fetch Summary Metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch('/api/stats/metrics', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error('Error loading metrics:', err);
    }
  }, [getHeaders]);

  // Fetch Department Stats (JOIN query)
  const fetchDeptStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats/department-summary', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setDeptStats(data);
      }
    } catch (err) {
      console.error('Error loading department stats:', err);
    }
  }, [getHeaders]);

  // Fetch Department list for dropdowns
  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch('/api/departments', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setDepartments(data);
      }
    } catch (err) {
      console.error('Error loading departments:', err);
    }
  }, [getHeaders]);

  // Fetch Employees (Supports Search & Department Filter)
  const fetchEmployees = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (selectedDepartment && selectedDepartment !== 'all') params.append('department_id', selectedDepartment);

      const res = await fetch(`/api/employees?${params.toString()}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (err) {
      console.error('Error loading employees:', err);
    }
  }, [getHeaders, searchTerm, selectedDepartment]);

  const refreshAllData = useCallback(() => {
    fetchMetrics();
    fetchDeptStats();
    fetchDepartments();
    fetchEmployees();
  }, [fetchMetrics, fetchDeptStats, fetchDepartments, fetchEmployees]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Handle Save (Add or Edit)
  const handleSaveEmployee = async (formData, id) => {
    const url = id ? `/api/employees/${id}` : '/api/employees';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: getHeaders(),
      body: JSON.stringify(formData)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to save employee');
    }

    showNotification('success', id ? 'Employee updated successfully!' : 'Employee added successfully!');
    refreshAllData();
  };

  // Handle Delete
  const handleDeleteEmployee = async (emp) => {
    if (!window.confirm(`Are you sure you want to delete "${emp.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/employees/${emp.id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      const data = await res.json();

      if (!res.ok) {
        showNotification('error', data.error || 'Failed to delete employee.');
        return;
      }

      showNotification('success', data.message || 'Employee deleted successfully.');
      refreshAllData();
    } catch (err) {
      showNotification('error', err.message || 'An error occurred while deleting.');
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      {notification && (
        <div className={`alert-box ${notification.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Metrics Cards */}
      <MetricsCards metrics={metrics} />

      {/* Department-wise Statistics */}
      <DepartmentStats stats={deptStats} />

      {/* Main Searchable & Filterable Table */}
      <EmployeeTable
        employees={employees}
        departments={departments}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        onAddEmployee={() => {
          setEditingEmployee(null);
          setIsModalOpen(true);
        }}
        onEditEmployee={(emp) => {
          setEditingEmployee(emp);
          setIsModalOpen(true);
        }}
        onDeleteEmployee={handleDeleteEmployee}
      />

      {/* Add / Edit Employee Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEmployee}
        employee={editingEmployee}
        departments={departments}
      />
    </div>
  );
};

export default DashboardPage;
