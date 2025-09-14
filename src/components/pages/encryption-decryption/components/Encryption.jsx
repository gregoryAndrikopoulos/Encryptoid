import { useCallback, useState } from "react";
import Dropzone from "./Dropzone.jsx";
import "../styles/Shared.css";
import { validateTxtFile } from "../utils/validation.js";

const TOKEN_LEN = 256;

const Encryption = () => {
  const [, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // "idle" | "processing" | "done"
  const [dropError, setDropError] = useState("");

  const onDropRejected = useCallback(() => {
    setFile(null);
    setStatus("idle");
    setDropError("Only .txt files are supported");
  }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    const f = acceptedFiles?.[0];
    setDropError("");
    if (!f) return;

    const { ok, error } = validateTxtFile(f);
    if (!ok) {
      setFile(null);
      setDropError(error);
      return;
    }

    setFile(f);
    setStatus("processing");
    await new Promise((r) => setTimeout(r, 500));
    setStatus("done");
  }, []);

  const handleReset = () => {
    setFile(null);
    setStatus("idle");
    setDropError("");
  };

  const isEncrypting = status === "processing";
  const done = status === "done";

  return (
    <div className="encryption" data-testid="page.encryption">
      {status === "idle" && (
        <>
          <h2 data-testid="encryption.title">Commencing file Encryption...</h2>
          <p className="directive" data-testid="encryption.directive">
            Upload a <code>.txt</code> file by dragging it into the area below
            or by selecting it manually. Encryption will begin automatically
            once the file is received. After completion, you’ll be provided with
            a unique {TOKEN_LEN}-character token (required for decryption) and
            the option to download your encrypted file.
          </p>
        </>
      )}
      {isEncrypting && (
        <h2 data-testid="encryption.title.processing">Encrypting…</h2>
      )}
      {done && <h2 data-testid="encryption.title.done">Encryption complete</h2>}

      {!done && (
        <div className="flow-md" data-testid="encryption.dropzone.wrap">
          <Dropzone
            onDrop={onDrop}
            onDropRejected={onDropRejected}
            testId="encryption.dropzone"
            disabled={isEncrypting}
          />
          {dropError && (
            <p
              className="drop-error"
              data-testid="encryption.drop.error"
              role="alert"
              aria-live="polite"
            >
              {dropError}
            </p>
          )}
        </div>
      )}

      {done && (
        <div
          className="encryption-results"
          data-testid="encryption.results"
          aria-live="polite"
        >
          <div className="token-block" data-testid="encryption.results.token">
            <p>
              <strong>Token</strong>
            </p>
            <input
              className="token-output"
              type="text"
              readOnly
              placeholder={`${TOKEN_LEN}-character token (coming soon)`}
              data-testid="encryption.token.value"
            />
            <small className="directive" data-testid="encryption.token.notice">
              Keep this token safe. You’ll need it to decrypt your file later.
            </small>

            <div className="button-container">
              <button
                className="primary-button"
                type="button"
                disabled
                data-testid="encryption.token.copy"
                title="Copy token (disabled in this PR)"
              >
                Copy Token
              </button>
              <button
                className="primary-button"
                type="button"
                disabled
                data-testid="encryption.download.encrypted"
                title="Download Encrypted File (disabled in this PR)"
              >
                Download Encrypted File
              </button>
              <button
                className="primary-button"
                type="button"
                onClick={handleReset}
                data-testid="encryption.action.reset"
                title="Encrypt another file"
              >
                Encrypt another file
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Encryption;
