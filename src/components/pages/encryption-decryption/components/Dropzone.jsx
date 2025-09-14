import { useDropzone } from "react-dropzone";
import { FaFileCirclePlus } from "react-icons/fa6";
import "../styles/Dropzone.css";

const Dropzone = ({
  onDrop,
  onDropRejected,
  testId = "dropzone",
  disabled = false,
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "text/plain": [".txt"] },
    multiple: false,
    maxFiles: 1,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={`dropzone ${isDragActive ? "dropzone--active" : ""} ${disabled ? "is-disabled" : ""}`}
      data-testid={testId}
      role="button"
      tabIndex={0}
      aria-label="Text file dropzone (.txt only)"
      aria-disabled={disabled}
    >
      <input {...getInputProps({ "data-testid": `${testId}.input` })} />
      <FaFileCirclePlus
        size={64}
        className="dropzone-icon"
        aria-hidden="true"
      />
      <p className="dropzone-hint">
        <strong>Drop your .txt file here</strong> or click to select
      </p>
      <small className="dropzone-subhint">Only .txt files are supported</small>
    </div>
  );
};

export default Dropzone;
