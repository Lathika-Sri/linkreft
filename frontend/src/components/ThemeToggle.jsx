import React, { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem(
      "theme",
      theme
    );
  }, [theme]);

  const toggleTheme = () => {
    setTheme(
      theme === "dark"
        ? "light"
        : "dark"
    );
  };

  return (
    <button
      className="link-toggle"
      onClick={toggleTheme}
      title="Switch Theme"
    >
      <div
        className={`link-chain ${
          theme === "dark"
            ? "chain-dark"
            : "chain-light"
        }`}
      >
        🔗
      </div>
    </button>
  );
}