const JOB_TYPES = ["full-time", "part-time", "internship", "contract"];

const JobForm = ({
  form,
  errors,
  requirements,
  onChange,
  onUpdateRequirement,
  onAddRequirement,
  onRemoveRequirement,
  onSubmit,
  submitting,
  submitError,
  submitLabel,
  cancelLabel,
  onCancel,
  showStatus = false,
  showAiNotice = false,
  jobCategory,
}) => {
  return (
    <form onSubmit={onSubmit} style={s.form} noValidate>
      <div style={s.field}>
        <label style={s.label}>
          Job Title <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          style={{ ...s.input, ...(errors.title ? s.inputErr : {}) }}
          type="text"
          placeholder="e.g. Senior Frontend Engineer"
          value={form.title}
          onChange={onChange("title")}
        />
        {errors.title && <p style={s.ferr}>{errors.title}</p>}
      </div>

      <div style={s.field}>
        <label style={s.label}>
          Company <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          style={{ ...s.input, ...(errors.company ? s.inputErr : {}) }}
          type="text"
          placeholder="e.g. Acme Corp"
          value={form.company}
          onChange={onChange("company")}
        />
        {errors.company && <p style={s.ferr}>{errors.company}</p>}
      </div>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ ...s.field, flex: 1 }}>
          <label style={s.label}>
            Location <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            style={{ ...s.input, ...(errors.location ? s.inputErr : {}) }}
            type="text"
            placeholder="e.g. Cairo, Egypt"
            value={form.location}
            onChange={onChange("location")}
          />
          {errors.location && <p style={s.ferr}>{errors.location}</p>}
        </div>
        <div style={{ ...s.field, flex: 1 }}>
          <label style={s.label}>
            Job Type <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <select style={s.input} value={form.type} onChange={onChange("type")}>
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
          {errors.type && <p style={s.ferr}>{errors.type}</p>}
        </div>
      </div>

      {showStatus && (
        <div style={s.field}>
          <label style={s.label}>
            Status <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <select style={s.input} value={form.status} onChange={onChange("status")}> 
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
          {errors.status && <p style={s.ferr}>{errors.status}</p>}
        </div>
      )}

      <div style={s.field}>
        <label style={s.label}>
          Description <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <textarea
          style={{ ...s.input, resize: "vertical", lineHeight: 1.6, fontFamily: "inherit", ...(errors.description ? s.inputErr : {}) }}
          rows={5}
          placeholder="Describe the role and responsibilities…"
          value={form.description}
          onChange={onChange("description")}
        />
        {errors.description && <p style={s.ferr}>{errors.description}</p>}
      </div>

      <div style={s.field}>
        <label style={s.label}>
          Requirements <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {requirements.map((req, index) => (
            <div key={index} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                style={{ ...s.input, flex: 1 }}
                type="text"
                placeholder={`Requirement ${index + 1}`}
                value={req}
                onChange={(e) => onUpdateRequirement(index, e.target.value)}
              />
              {requirements.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveRequirement(index)}
                  style={s.removeReqBtn}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.requirements && <p style={s.ferr}>{errors.requirements}</p>}
        <button type="button" onClick={onAddRequirement} style={s.addReqBtn}>
          + Add Requirement
        </button>
      </div>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ ...s.field, flex: 1 }}>
          <label style={s.label}>
            Salary (USD/yr)
            <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "#9ca3af" }}> optional</span>
          </label>
          <input
            style={{ ...s.input, ...(errors.salary ? s.inputErr : {}) }}
            type="number"
            min={0}
            placeholder="e.g. 60000"
            value={form.salary}
            onChange={onChange("salary")}
          />
          {errors.salary && <p style={s.ferr}>{errors.salary}</p>}
        </div>

        <div style={{ ...s.field, flex: 1 }}>
          <label style={s.label}>
            Total Slots
            <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "#9ca3af" }}> optional</span>
          </label>
          <input
            style={{ ...s.input, ...(errors.totalSlots ? s.inputErr : {}) }}
            type="number"
            min={1}
            placeholder="e.g. 3"
            value={form.totalSlots}
            onChange={onChange("totalSlots")}
          />
          {errors.totalSlots && <p style={s.ferr}>{errors.totalSlots}</p>}
        </div>
      </div>

      {showAiNotice && (
        <div style={s.noticeBox}>
          <span style={s.noticeIcon}>✨</span>
          <p style={s.noticeText}>
            <strong>Category is auto-assigned by AI</strong> — you'll see the result after posting.
          </p>
        </div>
      )}

      {jobCategory && (
        <div style={s.categoryCard}>
          <strong>AI-assigned category:</strong> {jobCategory}
        </div>
      )}

      {submitError && (
        <div style={s.errorBanner}>
          <span style={s.errorIcon}>⚠️</span>
          <div>
            <p style={s.errorTitle}>Cannot Post Job</p>
            <p style={s.errorText}>{submitError}</p>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
        {onCancel && (
          <button type="button" onClick={onCancel} style={s.cancelBtn}>
            {cancelLabel || "Cancel"}
          </button>
        )}
        <button type="submit" style={s.submitBtn} disabled={submitting}>
          {submitting ? submitLabel : submitLabel}
        </button>
      </div>
    </form>
  )
}

const s = {
  form: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.375rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    padding: "0.75rem 1rem",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    fontSize: "0.95rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    background: "#fff",
  },
  inputErr: {
    borderColor: "#ef4444",
    background: "#fef2f2",
  },
  ferr: {
    color: "#ef4444",
    fontSize: "0.8rem",
    margin: 0,
  },
  cancelBtn: {
    padding: "0.75rem 1.25rem",
    background: "#f3f4f6",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
  submitBtn: {
    padding: "0.75rem 1.5rem",
    background: "#2563EB",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: "0.95rem",
    cursor: "pointer",
  },
  addReqBtn: {
    alignSelf: "flex-start",
    padding: "0.5rem 1rem",
    background: "#eff6ff",
    color: "#2563EB",
    border: "1px solid #bfdbfe",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
  removeReqBtn: {
    width: 32,
    height: 32,
    background: "#fee2e2",
    color: "#b91c1c",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: "1.1rem",
  },
  noticeBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
    background: "#f5f3ff",
    border: "1px solid #ddd6fe",
    borderRadius: 10,
    padding: "1rem",
  },
  noticeIcon: {
    fontSize: "1.25rem",
    flexShrink: 0,
  },
  noticeText: {
    margin: 0,
    color: "#5b21b6",
    fontSize: "0.875rem",
    lineHeight: 1.5,
  },
  categoryCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "1rem",
    color: "#475569",
  },
  errorBanner: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 10,
    padding: "1rem",
    display: "flex",
    gap: "0.75rem",
    alignItems: "flex-start",
  },
  errorIcon: {
    fontSize: "1.25rem",
    flexShrink: 0,
  },
  errorTitle: {
    color: "#b91c1c",
    fontSize: "0.95rem",
    fontWeight: 600,
    margin: "0 0 0.25rem",
  },
  errorText: {
    color: "#7f1d1d",
    fontSize: "0.875rem",
    margin: 0,
    lineHeight: 1.5,
  },
};

export default JobForm;
