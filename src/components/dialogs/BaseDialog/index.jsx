import React from 'react';
import './style.css';
import { dialogFrames } from '../../../constants/baseimages';

const BaseDialog = ({ title, onClose, children }) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          "--dialog-edge-bg":`url(${dialogFrames.modalBgTopLeft}), url(${dialogFrames.modalBgTopRight}), url(${dialogFrames.modalBgBottomLeft}), url(${dialogFrames.modalBgBottomRight})`, 
          "--dialog-close": `url(${dialogFrames.modalClose})`,
          backgroundImage: `url(${dialogFrames.modalBgLeft}), url(${dialogFrames.modalBgRight}), url(${dialogFrames.modalBgTop}), url(${dialogFrames.modalBgBottom})`
        }}
      >
        <div className="modal-header">{title}</div>
        <div className="modal-close" onClick={onClose}></div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default BaseDialog;


