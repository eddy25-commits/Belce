import "./Loader.css";

export default function Loader({ label = "Loading..." }) {
  return (
    <div className="loader-wrap" role="status">
      <div className="loader-spinner" />
      <span>{label}</span>
    </div>
  );
}
