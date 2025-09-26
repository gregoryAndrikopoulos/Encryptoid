import { useCallback, useMemo, useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Dropzone from "./Dropzone.jsx";
import "../styles/Shared.css";
import { validateEncryptedTxtFile } from "../utils/validation.js";
import { decryptFile } from "../../../../services/encryption.js";

const REQUIRED_LEN = 256;

const Decryption = () => {
  const [file, setFile] = useState(null);
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [status, setStatus] = useState("idle"); // "idle" | "processing" | "done"
  const [dropError, setDropError] = useState("");

  // hold decrypted file for download
  const [decDownloadUrl, setDecDownloadUrl] = useState("");
  const [decFilename, setDecFilename] = useState("");

  useEffect(() => {
    return () => {
      if (decDownloadUrl) URL.revokeObjectURL(decDownloadUrl);
    };
  }, [decDownloadUrl]);

  const tokenValid = useMemo(() => token.length === REQUIRED_LEN, [token]);

  const onDrop = useCallback((acceptedFiles) => {
    const f = acceptedFiles?.[0];
    setDropError("");
    setStatus("idle");
    if (!f) return;

    const { ok, error } = validateEncryptedTxtFile(f);
    if (!ok) {
      setFile(null);
      setDropError(error);
      return;
    }
    setFile(f);
  }, []);

  const handleDecrypt = async () => {
    if (!file || !tokenValid || status === "processing") return;
    setStatus("processing");
    try {
      const { blob, filename } = await decryptFile(file, token);
      const url = URL.createObjectURL(blob);
      if (decDownloadUrl) URL.revokeObjectURL(decDownloadUrl);
      setDecDownloadUrl(url);
      setDecFilename(filename);
      setStatus("done");
    } catch {
      setStatus("idle");
      setDropError("Decryption failed or service unavailable.");
    }
  };

  const handleReset = () => {
    setFile(null);
    setToken("");
    setShowToken(false);
    setDropError("");
    if (decDownloadUrl) URL.revokeObjectURL(decDownloadUrl);
    setDecDownloadUrl("");
    setDecFilename("");
    setStatus("idle");
  };

  const done = status === "done";
  const isDecrypting = status === "processing";

  return (
    <div className="decryption" data-testid="page.decryption">
      {!done && (
        <h2 data-testid="decryption.title">Commencing file Decryption...</h2>
      )}
      {done && (
        <h2 data-testid="decryption.title.done">
          Decryption complete (placeholder)
        </h2>
      )}

      {!done && (
        <>
          <p className="directive" data-testid="decryption.directive">
            Drop an encrypted <code>.enc.txt</code> file and paste the{" "}
            {REQUIRED_LEN}-character token you saved. In this pull request,
            decryption and file download are placeholders only — the final logic
            will be added later.
          </p>

          <div className="flow-md" data-testid="decryption.dropzone.wrap">
            <Dropzone
              onDrop={onDrop}
              testId="decryption.dropzone"
              titleText="Drop your .enc.txt file here"
              subhintText="Only .enc.txt files are supported"
            />
            {dropError && (
              <p
                className="drop-error"
                data-testid="decryption.drop.error"
                role="alert"
                aria-live="polite"
              >
                {dropError}
              </p>
            )}
          </div>

          <div
            className="security-key-form"
            data-testid="decryption.token.form"
            aria-label="Token form"
          >
            <p
              className="security-key-label"
              data-testid="decryption.token.label"
            >
              Input Token ({token.length}/{REQUIRED_LEN})
            </p>

            <div className="security-key-field">
              <input
                className="security-key"
                type={showToken ? "text" : "password"}
                placeholder={`Paste the ${REQUIRED_LEN}-character token`}
                maxLength={REQUIRED_LEN}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                data-testid="decryption.token.input"
                aria-invalid={token.length > 0 && !tokenValid}
              />
              <button
                type="button"
                className="mask-toggle-button"
                aria-label={showToken ? "Hide token" : "Show token"}
                onClick={() => setShowToken((v) => !v)}
                data-testid="decryption.token.toggle"
                title={showToken ? "Hide token" : "Show token"}
              >
                {showToken ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="button-container">
              <button
                className="primary-button"
                type="button"
                onClick={handleDecrypt}
                disabled={!file || !tokenValid || isDecrypting}
                data-testid="decryption.action.decrypt"
                title={
                  !file
                    ? "Select an encrypted .txt file"
                    : !tokenValid
                      ? `Token must be exactly ${REQUIRED_LEN} characters`
                      : "Decrypt"
                }
              >
                {isDecrypting ? "Decrypting…" : "Decrypt"}
              </button>
            </div>

            {!tokenValid && token.length > 0 && (
              <small
                style={{ color: "var(--color-accent)" }}
                data-testid="decryption.token.help"
              >
                Token must be exactly {REQUIRED_LEN} characters. (This PR does
                not yet validate token contents.)
              </small>
            )}
          </div>
        </>
      )}

      {done && (
        <div
          className="decryption-results"
          data-testid="decryption.results"
          aria-live="polite"
        >
          <p className="directive" data-testid="decryption.results.note">
            The decrypted file download will be enabled once the real decryption
            logic is implemented.
          </p>
          <div className="button-container">
            <a
              className="primary-button"
              role="button"
              href={decDownloadUrl || undefined}
              download={decFilename || undefined}
              aria-disabled={!decDownloadUrl}
              data-testid="decryption.download.decrypted"
              title={
                decDownloadUrl
                  ? "Download Decrypted File"
                  : "Download Decrypted File (unavailable)"
              }
              onClick={(e) => {
                if (!decDownloadUrl) e.preventDefault();
              }}
            >
              Download Decrypted File
            </a>
            <button
              className="primary-button"
              type="button"
              onClick={handleReset}
              data-testid="decryption.action.reset"
              title="Decrypt another file"
            >
              Decrypt another file
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Decryption;
