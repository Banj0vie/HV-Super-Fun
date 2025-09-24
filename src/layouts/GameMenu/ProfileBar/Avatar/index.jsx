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
          
          // Find the first equipped avatar (not empty)
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
                
                if (tokenDataJson.image) {
                  setAvatarImage(tokenDataJson.image);
                  setLoading(false);
                  return;
                }
              }
            }
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
