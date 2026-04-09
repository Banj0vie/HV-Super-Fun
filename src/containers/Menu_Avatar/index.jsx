import React, { useState, useEffect } from "react";
import BaseDialog from "../_BaseDialog";
import "./style.css";
import NFTBox from "./NFTBox";
import { useEquipmentRegistry } from "../../hooks/useContracts";
import { useSolanaWallet } from "../../hooks/useSolanaWallet";
import CardView from "../../components/boxes/CardView";

const PFP_OPTIONS = [
  { id: 'benpotato',  src: '/images/pfp/benpotato.jpg',  label: 'Ben Potato',  description: 'The legendary spud himself — a true pioneer of the valley.', how: 'Awarded to the first 100 farmers to grow 100 potatoes.' },
  { id: 'goldcarrot', src: '/images/pfp/goldcarrot.jpg', label: 'Gold Carrot', description: 'A gleaming carrot crowned champion of the valley.', how: 'Win the Weekly Weight Contest when Carrot is the featured crop.' },
  { id: 'goldpotato', src: '/images/pfp/goldpotato.jpg', label: 'Gold Potato', description: 'A mighty spud forged through competition and glory.', how: 'Win the Weekly Weight Contest when Potato is the featured crop.' },
];

const AvatarDialog = ({ onClose }) => {
  const { account } = useSolanaWallet();
  const { getAvatars, getTokenBoostPpm } = useEquipmentRegistry();
  const [selectedPfp, setSelectedPfp] = useState(() => localStorage.getItem('sandbox_pfp') || null);
  const [avatars, setAvatars] = useState([{isEmpty: true}, {isEmpty: true}]);
  const [totalBoost, setTotalBoost] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvatarData = async () => {
      try {
        setLoading(true);

        // Fetch from local sandbox memory instead of the blockchain
        const sandboxAvatars = JSON.parse(localStorage.getItem('sandbox_avatars') || '{}');

        let boostPercentage = 0;

        // Create avatar data array
        const avatarData = [];
        for (let i = 0; i < 2; i++) {
          if (sandboxAvatars[i]) {
            boostPercentage += sandboxAvatars[i].boostPercentage || 0;
            avatarData.push({
              nft: sandboxAvatars[i], // Pass the whole object so the UI has access to the image
              tokenId: sandboxAvatars[i].tokenId,
              isEmpty: false
            });
          } else {
            avatarData.push({
              nft: null,
              tokenId: null,
              isEmpty: true
            });
          }
        }

        setAvatars(avatarData);
        setTotalBoost(boostPercentage);
      } catch (error) {
        console.error('Failed to fetch avatar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatarData();
  }, [account]); // Removed getAvatars and getTokenBoostPpm from deps to prevent infinite loops (they're stubs)

  const hasAnyNFTs = avatars.some(avatar => !avatar.isEmpty);

  const handleAvatarChange = (slotIndex, selectedNFT) => {
    // Update the avatars state
    setAvatars(prevAvatars => {
      const newAvatars = [...prevAvatars];
      if (!selectedNFT) {
        newAvatars[slotIndex] = { nft: null, tokenId: null, isEmpty: true };
      } else {
        newAvatars[slotIndex] = {
          nft: selectedNFT,
          tokenId: selectedNFT.tokenId,
          isEmpty: false
        };
      }

      // Recalculate total boost dynamically based on the updated slots
      const newTotalBoost = (newAvatars[0].isEmpty ? 0 : (newAvatars[0].nft?.boostPercentage || 0)) + (newAvatars[1].isEmpty ? 0 : (newAvatars[1].nft?.boostPercentage || 0));
      setTotalBoost(newTotalBoost);
      return newAvatars;
    });
  };

  const handleSelectPfp = (pfp) => {
    setSelectedPfp(pfp.src);
    localStorage.setItem('sandbox_pfp', pfp.src);
    window.dispatchEvent(new CustomEvent('pfpUpdated', { detail: pfp.src }));
  };

  const equippedPfp = PFP_OPTIONS.find(p => p.src === selectedPfp) || null;
  const otherPfps = PFP_OPTIONS.filter(p => p.src !== selectedPfp);

  return <BaseDialog onClose={onClose} title="PROFILE PICTURE" header="/images/dialog/modal-header-worker.png">
    <div className="avatar-dialog" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '8px' }}>

      {/* Equipped PFP - large, centered */}
      {equippedPfp ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <img
            src={equippedPfp.src}
            alt={equippedPfp.label}
            style={{ width: '140px', height: '140px', objectFit: 'cover', borderRadius: '50%', border: '4px solid #ffea00', boxShadow: '0 0 16px rgba(255,234,0,0.5)' }}
          />
          <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 'bold', color: '#ffea00' }}>{equippedPfp.label}</span>
          <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#ccc', textAlign: 'center', maxWidth: '220px' }}>{equippedPfp.description}</span>
          <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#a67c52', textAlign: 'center', maxWidth: '220px', fontStyle: 'italic' }}>🏆 {equippedPfp.how}</span>
        </div>
      ) : (
        <div style={{ width: '140px', height: '140px', borderRadius: '50%', border: '4px dashed #5a402a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#5a402a', textAlign: 'center' }}>No PFP<br/>equipped</span>
        </div>
      )}

      {/* Divider */}
      <div style={{ width: '100%', borderTop: '1px solid #5a402a', marginTop: '4px' }} />

      {/* Other PFPs - smaller row */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {otherPfps.map(pfp => (
          <div
            key={pfp.id}
            onClick={() => handleSelectPfp(pfp)}
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '6px', borderRadius: '10px', border: '2px solid #5a402a', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#a67c52'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#5a402a'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <img src={pfp.src} alt={pfp.label} style={{ width: '65px', height: '65px', objectFit: 'cover', borderRadius: '50%', border: '2px solid #a67c52' }} />
            <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#ccc' }}>{pfp.label}</span>
          </div>
        ))}
      </div>

    </div>
  </BaseDialog>;
};

export default AvatarDialog;
