import React from "react";

export default function Footer() {
  return (
    <footer className="footer">
      <p className="footer-text">
        © {new Date().getFullYear()} Made by Uwem Utuk. All rights reserved.
      </p>
    </footer>
  );
}