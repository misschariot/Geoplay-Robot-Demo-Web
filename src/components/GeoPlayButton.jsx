import "./GeoPlayButton.css";

function GeoPlayButton({
  children,
  type = "button",
  size = "large",
  variant = "primary",
  width: _legacyWidth,
  disabled = false,
  onClick,
  className = "",
  ...props
}) {
  const classes = [
    "geoplay-button",
    `geoplay-button--${size}`,
    `geoplay-button--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export default GeoPlayButton;
