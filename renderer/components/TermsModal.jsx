import './TermsModal.css';

export function TermsModal({ onAccept }) {
  return (
    <div className="terms-overlay">
      <div className="terms-modal">
        <div className="terms-logo">CNVTR</div>
        <h1>Terms of Use</h1>
        <div className="terms-content">
          <p>
            By using CNVTR you agree to the following:
          </p>
          <ul>
            <li>You are responsible for ensuring you have the right to download and use any content. Only use with <strong>public</strong> content you are allowed to use.</li>
            <li>CNVTR does not bypass DRM or access private/restricted content. We do not support circumvention of access controls.</li>
            <li>Respect platform terms of service and rate limits. Do not abuse automated requests.</li>
            <li>CNVTR is provided &quot;as is&quot;. The developers are not liable for misuse or copyright infringement by users.</li>
          </ul>
          <p className="terms-disclaimer">
            If you do not agree, please close the application.
          </p>
        </div>
        <button type="button" className="terms-accept" onClick={onAccept}>
          I agree — Continue
        </button>
      </div>
    </div>
  );
}
