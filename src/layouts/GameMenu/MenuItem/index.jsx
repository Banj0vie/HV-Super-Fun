import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

const MenuItem = ({ path, icon, label, isActive }) => {
  return (
    <Link
      to={path}
      className={`menu-item ${isActive ? 'active' : ''}`}
    >
      <div className="menu-icon">
        <img src={icon} alt={label} className="menu-icon-img" />
      </div>
    </Link>
  );
}

export default MenuItem;
