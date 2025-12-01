import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <header className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
      <Link to="/" style={{ fontWeight: 700, fontSize: '1.25rem' }}>VCB</Link>
      <nav>
        <ul style={{ display: 'flex', gap: '1.5rem', listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem' }}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/product">Products</Link></li>
          <li><Link to="/salesagent">Sales Agent</Link></li>
          <li><Link to="/partners">Partners</Link></li>
        </ul>
      </nav>
    </div>
    {children}
  </header>
);

export default Header;
