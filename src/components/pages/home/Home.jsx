import { Link } from "react-router-dom";
import {
  MdOutlineEnhancedEncryption,
  MdOutlineNoEncryptionGmailerrorred,
} from "react-icons/md";
import "./Home.css";

const Home = () => {
  return (
    <section className="home" data-testid="page.home">
      <div className="actions-grid" data-testid="home.actions">
        <Link
          to="/encryption"
          className="card cta"
          data-testid="home.card.encryption"
        >
          <div className="card-icon" data-testid="home.card.encryption.icon">
            <MdOutlineEnhancedEncryption size={32} />
          </div>
          <h2 className="card-title" data-testid="home.card.encryption.title">
            Encrypt a file
          </h2>
          <p className="card-text" data-testid="home.card.encryption.text">
            Drop a <code>.txt</code> file, get a secure 256-character token, and
            download the encrypted output.
          </p>
        </Link>

        <Link
          to="/decryption"
          className="card cta"
          data-testid="home.card.decryption"
        >
          <div className="card-icon" data-testid="home.card.decryption.icon">
            <MdOutlineNoEncryptionGmailerrorred size={32} />
          </div>
          <h2 className="card-title" data-testid="home.card.decryption.title">
            Decrypt a file
          </h2>
          <p className="card-text" data-testid="home.card.decryption.text">
            Provide your <code>.enc.txt</code> file and the token to restore the
            original contents.
          </p>
        </Link>
      </div>

      <section className="how-it-works" data-testid="home.howto">
        <h3 data-testid="home.howto.title">How it works</h3>
        <ol data-testid="home.howto.list">
          <li data-testid="home.howto.step.encrypt">
            <strong>Encrypt:</strong> Upload <code>.txt</code> receive encrypted
            file + a 256-char token.
          </li>
          <li data-testid="home.howto.step.store">
            <strong>Store token safely:</strong> You’ll need it to decrypt.
          </li>
          <li data-testid="home.howto.step.decrypt">
            <strong>Decrypt:</strong> Upload <code>.enc.txt</code> + paste the
            token download the original.
          </li>
        </ol>
      </section>

      <section className="notes" data-testid="home.notes">
        <h3 data-testid="home.notes.title">Notes</h3>
        <ul data-testid="home.notes.list">
          <li data-testid="home.notes.item.1">
            Only plain text files (<code>.txt</code>) are accepted for
            encryption.
          </li>
          <li data-testid="home.notes.item.2">
            Decryption requires the exact 256-character token produced during
            encryption.
          </li>
          <li data-testid="home.notes.item.3">
            Keep the token private — treat it like a password.
          </li>
        </ul>
      </section>
    </section>
  );
};

export default Home;
