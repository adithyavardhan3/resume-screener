import { useRef } from "react";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function isAllowedFile(file) {
  return /\.(pdf|docx)$/i.test(file.name) && file.size <= MAX_FILE_SIZE_BYTES;
}

export default function Dropzone({ multiple, files, onFilesSelected, title, subtitle }) {
  const inputRef = useRef(null);
  const hasFile = files && files.length > 0;

  function handleChange(event) {
    const selected = Array.from(event.target.files).filter(isAllowedFile);
    if (selected.length) onFilesSelected(selected);
    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    const dropped = Array.from(event.dataTransfer.files).filter(isAllowedFile);
    if (dropped.length) onFilesSelected(multiple ? dropped : [dropped[0]]);
  }

  const displayTitle = hasFile
    ? multiple
      ? `✓ ${files.length} file${files.length > 1 ? "s" : ""} selected`
      : `✓ ${files[0].name}`
    : title;

  return (
    <div
      className={`dropzone ${hasFile ? "has-file" : ""}`}
      onClick={() => inputRef.current.click()}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="dz-title">{displayTitle}</div>
      <div className="dz-sub">{subtitle}</div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        multiple={multiple}
        onChange={handleChange}
      />
    </div>
  );
}
