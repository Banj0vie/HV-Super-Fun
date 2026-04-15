import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MENU_ITEMS } from '../../constants/app_menu';
import MenuItem from './MenuItem';
import './style.css';

const getTutState = () => ({
  step: parseInt(localStorage.getItem('sandbox_tutorial_step') || '0', 10),
  page: parseInt(localStorage.getItem('sandbox_tut_page') || '1', 10),
});

const GameMenu = () => {
  const location = useLocation();
  const [tutState, setTutState] = useState(getTutState);

  useEffect(() => {
    const update = () => setTutState(getTutState());
    window.addEventListener('tutorialStepChanged', update);
    window.addEventListener('tutPageChanged', update);
    return () => {
      window.removeEventListener('tutorialStepChanged', update);
      window.removeEventListener('tutPageChanged', update);
    };
  }, []);

  const highlightMarket = tutState.step === 3 && tutState.page === 12;

  return (
    <nav className="game-menu">
      <div style={{marginBottom: 150}}></div>
      {MENU_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <MenuItem
            key={item.path}
            path={item.path}
            icon={item.icon}
            label={item.label}
            labelIcon={item.labelIcon}
            iconScale={item.iconScale}
            isActive={isActive}
            highlight={highlightMarket && item.path === '/market'}
          />
        );
      })}
    </nav>
  );
}

export default GameMenu;
