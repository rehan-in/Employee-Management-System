import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, ArrowRight, ArrowLeft, User, Briefcase, Check } from 'lucide-react';

/**
 * EmployeeModal Component
 * Provides a 2-section wizard for creating and editing employee records.
 * 
 * Features:
 * 1. Strict Phone Validation: Prevents typing or pasting alphabetic characters or symbols into the phone section.
 *    Only numbers (digits 0-9) and an optional leading '+' (10 to 15 digits) are permitted.
 * 2. Multi-Section Progression: Divides form into Section 1 (Personal Info) and Section 2 (Employment Details).
 *    Enforces completion of Section 1 before allowing transition to Section 2.
 *    If Section 1 is incomplete or invalid, user is prevented from proceeding and prompted to enter Section 1 first.
 */
const EmployeeModal = ({ isOpen, onClose, onSave, employee, departments }) => {
  // Step State: 1 = Section 1 (Personal Details), 2 = Section 2 (Employment Details)
  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    salary: '',
    department_id: ''
  });

  // UI States for error alert and submission loading
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset form or populate with existing employee data when modal opens/changes
  useEffect(() => {
    if (employee) {
      // Sanitize phone number from any legacy characters, hyphens or spaces
      let cleanedPhone = (employee.phone || '').toString().replace(/[^\d+]/g, '');
      if (cleanedPhone.includes('+')) {
        cleanedPhone = '+' + cleanedPhone.replace(/\+/g, '');
      }

      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        phone: cleanedPhone,
        salary: employee.salary || '',
        department_id: employee.department_id || (departments[0]?.id || '')
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        salary: '',
        department_id: departments[0]?.id || ''
      });
    }
    // Always start at Section 1 (Step 1) when opening modal
    setCurrentStep(1);
    setError('');
  }, [employee, departments, isOpen]);

  if (!isOpen) return null;

  // =========================================================================
  // Phone Input Key Handler: Blocks typing alphabetic and special characters
  // =========================================================================
  const handlePhoneKeyDown = (e) => {
    // Allow functional navigation and editing keys
    const allowedNavigationKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
      'Enter'
    ];

    // Allow standard shortcuts (Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X)
    if (e.ctrlKey || e.metaKey || allowedNavigationKeys.includes(e.key)) {
      return;
    }

    // Allow leading '+' sign only if cursor is at the first position and no '+' exists yet
    if (e.key === '+') {
      const input = e.target;
      if (input.selectionStart === 0 && !formData.phone.includes('+')) {
        return;
      }
      e.preventDefault();
      return;
    }

    // Block any non-digit character from being entered (disallows letters 'a'-'z', symbols, etc.)
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // =========================================================================
  // Generic Change Handler with Strict Phone Sanitization
  // =========================================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for phone field: strip any non-digit characters (except optional leading '+')
    if (name === 'phone') {
      // 1. Remove all characters except digits (0-9) and '+'
      let cleanedPhone = value.replace(/[^\d+]/g, '');

      // 2. Ensure '+' can only exist at the start and cannot appear more than once
      if (cleanedPhone.includes('+')) {
        cleanedPhone = '+' + cleanedPhone.replace(/\+/g, '');
      }

      // 3. Restrict phone length to 15 digits (standard international phone limit)
      if (cleanedPhone.length > 15) {
        cleanedPhone = cleanedPhone.slice(0, 15);
      }

      setFormData((prev) => ({ ...prev, [name]: cleanedPhone }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // =========================================================================
  // Validation for Section 1 (Personal Information)
  // Ensures user enters Name, valid Email, and valid Phone before allowing "Next"
  // =========================================================================
  const validateSectionOne = () => {
    // 1. Validate Full Name
    if (!formData.name.trim()) {
      setError('Please enter Full Name in Section 1 before proceeding.');
      return false;
    }

    // 2. Validate Email Address format
    if (!formData.email.trim()) {
      setError('Please enter Email Address in Section 1 before proceeding.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address (e.g. user@company.com) in Section 1.');
      return false;
    }

    // 3. Validate Phone Number (must only contain digits, 10 to 15 numbers, optional leading '+')
    if (!formData.phone.trim()) {
      setError('Please enter Phone Number in Section 1 before proceeding.');
      return false;
    }
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      setError('Phone number must contain only numbers (10 to 15 digits, optional leading +) without characters.');
      return false;
    }

    // Clear error if Section 1 passes all checks
    setError('');
    return true;
  };

  // =========================================================================
  // Validation for Section 2 (Employment Details)
  // =========================================================================
  const validateSectionTwo = () => {
    if (!formData.department_id) {
      setError('Please select a Department in Section 2.');
      return false;
    }

    if (!formData.salary || isNaN(formData.salary) || parseFloat(formData.salary) <= 0) {
      setError('Please enter a valid Annual Salary greater than 0.');
      return false;
    }

    setError('');
    return true;
  };

  // =========================================================================
  // Wizard Navigation: Move to Next Section (Step 2)
  // Only permitted if Section 1 is properly filled, otherwise prompts to enter first
  // =========================================================================
  const handleNextSection = (e) => {
    if (e) e.preventDefault();

    // Verify first section is complete and valid
    if (!validateSectionOne()) {
      // If validation fails, stay on Section 1 and display error message
      return;
    }

    // If first section is valid, transition to Section 2 (Employment Details)
    setCurrentStep(2);
  };

  // Navigate back to Section 1 (Personal Details)
  const handlePrevSection = () => {
    setError('');
    setCurrentStep(1);
  };

  // Direct tab header click handler
  const handleTabClick = (targetStep) => {
    if (targetStep === 1) {
      // User can always return to Section 1
      setError('');
      setCurrentStep(1);
    } else if (targetStep === 2) {
      // Prevent jumping to Section 2 without completing Section 1
      if (!validateSectionOne()) {
        return;
      }
      setCurrentStep(2);
    }
  };

  // =========================================================================
  // Final Form Submission: Validates both sections before saving
  // =========================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Ensure Section 1 is still completely valid
    if (!validateSectionOne()) {
      setCurrentStep(1); // Redirect user to Section 1 if any field was cleared
      return;
    }

    // Ensure Section 2 is complete
    if (!validateSectionTwo()) {
      setCurrentStep(2);
      return;
    }

    setSubmitting(true);
    try {
      await onSave(formData, employee?.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save employee record.');
    } finally {
      setSubmitting(false);
    }
  };

  // Determine if Section 1 is currently valid for visual step indicator state
  const isSectionOneValid = Boolean(
    formData.name.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) &&
    /^\+?[0-9]{10,15}$/.test(formData.phone.trim())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {employee ? 'Edit Employee Record' : 'Add New Employee'}
          </h2>
          <button className="modal-close" onClick={onClose} title="Close Modal">
            <X size={20} />
          </button>
        </div>

        {/* Multi-Section Step Indicator Tabs */}
        <div className="modal-steps-nav">
          <button
            type="button"
            className={`step-tab-btn ${currentStep === 1 ? 'active' : ''} ${isSectionOneValid ? 'completed' : ''}`}
            onClick={() => handleTabClick(1)}
            title="Go to Section 1: Personal Information"
          >
            <div className="step-badge">
              {isSectionOneValid && currentStep !== 1 ? <Check size={14} /> : '1'}
            </div>
            <span>1. Personal Info</span>
          </button>

          <button
            type="button"
            className={`step-tab-btn ${currentStep === 2 ? 'active' : ''}`}
            onClick={() => handleTabClick(2)}
            title="Go to Section 2: Employment Details"
          >
            <div className="step-badge">2</div>
            <span>2. Employment Details</span>
          </button>
        </div>

        {/* Error Notification Alert */}
        {error && (
          <div className="alert-box alert-error" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ========================================================================= */}
          {/* SECTION 1: Personal Information (Name, Email, Phone Number)               */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div>
              <div className="section-indicator-badge">
                <User size={14} />
                <span>Section 1: Personal Information</span>
              </div>

              {/* Full Name */}
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  style={{ paddingLeft: '14px' }}
                  placeholder="e.g. Sarah Connor"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>

              {/* Email Address */}
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  style={{ paddingLeft: '14px' }}
                  placeholder="e.g. sarah.c@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Phone Number: Only numbers allowed, blocks typing any characters */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Phone Number *</label>
                  <small style={{ color: 'var(--text-subtle)', fontSize: '0.72rem' }}>
                    Numbers only (10–15 digits)
                  </small>
                </div>
                <input
                  type="tel"
                  name="phone"
                  inputMode="numeric"
                  className="form-input"
                  style={{ paddingLeft: '14px' }}
                  placeholder="e.g. +1555019912 or 9876543210"
                  value={formData.phone}
                  onKeyDown={handlePhoneKeyDown}
                  onChange={handleChange}
                  maxLength={16}
                  required
                />
              </div>

              {/* Section 1 Actions: Cancel and Next */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNextSection}
                  title="Complete section 1 to proceed to next section"
                >
                  <span>Next: Employment Details</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 2: Employment Details (Department, Salary)                        */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div>
              <div className="section-indicator-badge">
                <Briefcase size={14} />
                <span>Section 2: Employment Details</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Department Selection */}
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select
                    name="department_id"
                    className="form-select"
                    value={formData.department_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.department_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Annual Salary */}
                <div className="form-group">
                  <label className="form-label">Annual Salary ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="salary"
                    className="form-input"
                    style={{ paddingLeft: '14px' }}
                    placeholder="e.g. 85000"
                    value={formData.salary}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Section 2 Actions: Back to Section 1 and Save/Submit */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handlePrevSection}
                  disabled={submitting}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  <Save size={16} />
                  <span>
                    {submitting
                      ? 'Saving...'
                      : employee
                      ? 'Update Employee'
                      : 'Create Employee'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
