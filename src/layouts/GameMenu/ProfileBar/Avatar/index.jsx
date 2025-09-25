import React, { useState, useEffect } from "react";
import "./style.css";
import AvatarDialog from "../../../../containers/Menu_Avatar";
import { useEquipmentRegistry } from "../../../../hooks/useContracts";
import { useAgwEthersAndService } from "../../../../hooks/useAgwEthersAndService";
import { useContractBase } from "../../../../hooks/useContractBase";

const Avatar = ({ src, alt = "avatar" }) => {
  const [isAvatarDialog, setIsAvatarDialog] = useState(false);
  const [avatarImage, setAvatarImage] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { account } = useAgwEthersAndService();
  const { getAvatars } = useEquipmentRegistry();
  const { getContract, publicClient } = useContractBase(['BOOST_NFT']);
  
  const fallbackSrc = "/images/avatars/avatar-left-placeholder.png";

  useEffect(() => {
    const fetchAvatarImage = async () => {
      if (!account || !getAvatars || !publicClient) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get equipped avatars
        const avatarResult = await getAvatars(account);
        
        // Check if we have any equipped avatars
        if (avatarResult && Array.isArray(avatarResult) && avatarResult.length >= 2) {
          const [nfts, tokenIds] = avatarResult;
          
          // Collect all equipped avatars with their metadata
          const equippedAvatars = [];
          
          for (let i = 0; i < nfts.length && i < 2; i++) {
            if (nfts[i] && nfts[i] !== "0x0000000000000000000000000000000000000000" && tokenIds[i]) {
              // Get token metadata for this avatar
              const boostNFT = getContract('BOOST_NFT');
              if (boostNFT) {
                const tokenURI = await publicClient.readContract({
                  address: boostNFT.address,
                  abi: boostNFT.abi,
                  functionName: 'tokenURI',
                  args: [tokenIds[i]]
                });

                const tokenData = await fetch(tokenURI);
                const tokenDataJson = await tokenData.json();
                
                // Extract boost value from attributes
                let boostValue = 0;
                if (tokenDataJson.attributes && Array.isArray(tokenDataJson.attributes)) {
                  const boostAttribute = tokenDataJson.attributes.find(attr => 
                    attr.trait_type === 'Boost (ppm)' || attr.trait_type === 'Boost (%)'
                  );
                  
                  if (boostAttribute) {
                    if (boostAttribute.trait_type === 'Boost (ppm)') {
                      boostValue = Number(boostAttribute.value);
                    } else if (boostAttribute.trait_type === 'Boost (%)') {
                      boostValue = Number(boostAttribute.value) * 1000; // Convert to ppm for comparison
                    }
                  }
                }
                
                equippedAvatars.push({
                  tokenId: tokenIds[i],
                  image: tokenDataJson.image,
                  boostValue: boostValue,
                  slotIndex: i
                });
              }
            }
          }
          
          // Sort by boost value (descending), then by slot index (ascending)
          equippedAvatars.sort((a, b) => {
            if (b.boostValue !== a.boostValue) {
              return b.boostValue - a.boostValue; // Higher boost first
            }
            return a.slotIndex - b.slotIndex; // Lower slot index first if same boost
          });
          
          // Use the best avatar
          if (equippedAvatars.length > 0 && equippedAvatars[0].image) {
            setAvatarImage(equippedAvatars[0].image);
            setLoading(false);
            return;
          }
        }
        
        // No equipped avatar found, use placeholder
        setAvatarImage(null);
      } catch (error) {
        console.error('Failed to fetch avatar image:', error);
        setAvatarImage(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatarImage();
  }, [account, getAvatars, publicClient, getContract]);

  const resolvedSrc = src || avatarImage || fallbackSrc;

  return (
    <div className="avatar">
      {loading ? (
        <div className="loading-placeholder">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <img
          src={resolvedSrc}
          alt={alt}
          className="avatar-img"
          onClick={() => setIsAvatarDialog(true)}
          onError={(e) => {
            e.target.src = fallbackSrc;
          }}
        />
      )}
      {isAvatarDialog && <AvatarDialog onClose={()=>setIsAvatarDialog(false)}></AvatarDialog>}
    </div>
  );
};

export default Avatar;
