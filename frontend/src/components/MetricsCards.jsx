import React from 'react';
import { Users, Layers, DollarSign, PieChart } from 'lucide-react';

const MetricsCards = ({ metrics }) => {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const cards = [
    {
      title: 'Total Employees',
      value: metrics?.totalEmployees || 0,
      subtext: 'Active workforce members',
      icon: Users,
      accent: '#6366f1'
    },
    {
      title: 'Total Departments',
      value: metrics?.totalDepartments || 0,
      subtext: 'Operational units',
      icon: Layers,
      accent: '#06b6d4'
    },
    {
      title: 'Avg Employee Salary',
      value: formatCurrency(metrics?.avgCompanySalary),
      subtext: 'Across all departments',
      icon: DollarSign,
      accent: '#10b981'
    },
    {
      title: 'Total Annual Payroll',
      value: formatCurrency(metrics?.totalPayroll),
      subtext: 'Gross annual compensation',
      icon: PieChart,
      accent: '#f59e0b'
    }
  ];

  return (
    <div className="metrics-grid">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="glass-panel metric-card"
            style={{ '--card-accent': card.accent }}
          >
            <div className="metric-header">
              <span className="metric-title">{card.title}</span>
              <div className="metric-icon-bg" style={{ color: card.accent }}>
                <IconComponent size={22} />
              </div>
            </div>
            <div className="metric-value">{card.value}</div>
            <div className="metric-subtext">{card.subtext}</div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsCards;
