import React from 'react';

const ExportButtons = ({
  activeTab,
  onExport,
  canExport,
  exportDisabledReason,
  isExporting,
}) => {
  return (
    <div className="reports-export-actions">
      <button
        type="button"
        className="reports-export-btn"
        disabled={!canExport || isExporting}
        title={!canExport ? exportDisabledReason : 'Export current report as PDF'}
        onClick={() => onExport('pdf', activeTab)}
      >
        Export PDF
      </button>
      <button
        type="button"
        className="reports-export-btn secondary"
        disabled={!canExport || isExporting}
        title={!canExport ? exportDisabledReason : 'Export current report as Excel'}
        onClick={() => onExport('excel', activeTab)}
      >
        Export Excel
      </button>
    </div>
  );
};

export default ExportButtons;
