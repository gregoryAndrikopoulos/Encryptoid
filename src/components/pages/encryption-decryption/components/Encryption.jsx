import { useCallback, useEffect, useState } from "react";
import Dropzone from "./Dropzone.jsx";
import "../styles/Shared.css";
import { validateTxtFile } from "../utils/validation.js";
import { encryptFile } from "../../../../services/encryption.js";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TOKEN_LEN = 256;
const COPY_TOAST_ID = "token-copied"; // Prevent spam clicks

const Encryption = () => {
  const [, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // "idle" | "processing" | "done"
  const [dropError, setDropError] = useState("");

  // hold token + downloadable encrypted file
  const [token, setToken] = useState("");
  const [encDownloadUrl, setEncDownloadUrl] = useState("");
  const [encFilename, setEncFilename] = useState("");

  // revoke object URL when replaced/cleared
  useEffect(() => {
    return () => {
      if (encDownloadUrl) URL.revokeObjectURL(encDownloadUrl);
    };
  }, [encDownloadUrl]);

  const onDropRejected = useCallback(() => {
    setFile(null);
    setStatus("idle");
    setDropError("Only .txt files are supported");
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles) => {
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
      try {
        // call backend to encrypt; do NOT auto-download
        const { token, blob, filename } = await encryptFile(f);
        // prepare download link and show token
        const url = URL.createObjectURL(blob);
        // clean previous url if existed
        if (encDownloadUrl) URL.revokeObjectURL(encDownloadUrl);
        setEncDownloadUrl(url);
        setEncFilename(filename);
        setToken(token);
        setStatus("done");
      } catch {
        setStatus("idle");
        setDropError("Encryption service is unavailable.");
      }
    },
    [encDownloadUrl]
  );

  const handleReset = () => {
    setFile(null);
    setStatus("idle");
    setDropError("");
    setToken("");
    if (encDownloadUrl) URL.revokeObjectURL(encDownloadUrl);
    setEncDownloadUrl("");
    setEncFilename("");
  };

  const handleCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(token);

      // prevent spam clicks: reuse same toast
      if (toast.isActive(COPY_TOAST_ID)) {
        toast.update(COPY_TOAST_ID, {
          render: <span data-testid="toast.token.copied">Token copied</span>,
          type: "success",
          autoClose: 5000,
        });
      } else {
        toast.success(
          <span data-testid="toast.token.copied">Token copied</span>,
          {
            toastId: COPY_TOAST_ID,
            autoClose: 5000,
          }
        );
      }
    } catch {
      // silent fallback
    }
  };

  const isEncrypting = status === "processing";
  const done = status === "done";

  return (
    <div className="encryption" data-testid="page.encryption">
      <ToastContainer position="top-center" autoClose={2200} hideProgressBar />

      {status === "idle" && (
        <>
          <h2 data-testid="encryption.title">Commencing file Encryption...</h2>
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
              value={token}
              placeholder={`${TOKEN_LEN}-character token`}
              data-testid="encryption.token.value"
              onClick={handleCopyToken}
            />
            <small className="directive" data-testid="encryption.token.notice">
              Keep this token safe for decryption.
            </small>

            <div className="button-container">
              <button
                className="primary-button"
                type="button"
                onClick={handleCopyToken}
                disabled={!token}
                data-testid="encryption.token.copy"
                title={token ? "Copy token" : "Copy token (unavailable)"}
              >
                Copy Token
              </button>
              <a
                className="primary-button"
                role="button"
                href={encDownloadUrl || undefined}
                download={encFilename || undefined}
                aria-disabled={!encDownloadUrl}
                data-testid="encryption.download.encrypted"
                title={
                  encDownloadUrl
                    ? "Download Encrypted File"
                    : "Download Encrypted File (unavailable)"
                }
                onClick={(e) => {
                  if (!encDownloadUrl) e.preventDefault();
                }}
              >
                Download Encrypted File
              </a>
              <button
                className="primary-button"
                type="button"
                onClick={handleReset}
                data-testid="encryption.action.reset"
                title="Encrypt Another File"
              >
                Encrypt Another File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Encryption;
