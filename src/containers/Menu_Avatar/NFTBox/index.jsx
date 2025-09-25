import React, { useState, useEffect } from 'react';
import './style.css';
import CardView from '../../../components/boxes/CardView';
import { useContractBase } from '../../../hooks/useContractBase';
import BoostNFTSelector from '../BoostNFTSelector';

const NFTBox = ({ avatar, loading, slotIndex, onAvatarChange, allAvatars = [] }) => {
    const [nftData, setNftData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showSelector, setShowSelector] = useState(false);
    const { getContract, publicClient } = useContractBase(['BOOST_NFT']);

    useEffect(() => {
        const fetchNFTData = async () => {
            if (!avatar || avatar.isEmpty || loading) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                
                const boostNFT = getContract('BOOST_NFT');
                if (!boostNFT || !publicClient) {
                    throw new Error('BoostNFT contract not available');
                }

                // Fetch token metadata from tokenURI
                const tokenURI = await publicClient.readContract({
                    address: boostNFT.address,
                    abi: boostNFT.abi,
                    functionName: 'tokenURI',
                    args: [avatar.tokenId]
                });

                const tokenData = await fetch(tokenURI);
                const tokenDataJson = await tokenData.json();
                
                // Parse the token metadata
                const name = tokenDataJson.name || `Character #${avatar.tokenId}`;
                const image = tokenDataJson.image || '';
                
                // Extract boost values from attributes
                let boostPercentage = 0;
                if (tokenDataJson.attributes && Array.isArray(tokenDataJson.attributes)) {
                    const boostAttribute = tokenDataJson.attributes.find(attr => 
                        attr.trait_type === 'Boost (ppm)' || attr.trait_type === 'Boost (%)'
                    );
                    
                    if (boostAttribute) {
                        if (boostAttribute.trait_type === 'Boost (ppm)') {
                            boostPercentage = Number(boostAttribute.value) / 1000; // Convert ppm to percentage
                        } else if (boostAttribute.trait_type === 'Boost (%)') {
                            boostPercentage = Number(boostAttribute.value);
                        }
                    }
                }

                setNftData({
                    tokenId: avatar.tokenId,
                    name,
                    image,
                    boost: boostPercentage.toFixed(2)
                });
            } catch (error) {
                console.error('Failed to fetch NFT data:', error);
                // Fallback data
                setNftData({
                    tokenId: avatar.tokenId,
                    name: `Character #${avatar.tokenId}`,
                    boost: '0.00'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchNFTData();
    }, [avatar, loading, getContract, publicClient]);

    const handleClick = () => {
        setShowSelector(true);
    };

    const handleNFTSelect = (selectedNFT) => {
        // Update the avatar data
        setNftData({
            tokenId: selectedNFT.tokenId,
            name: selectedNFT.name,
            image: selectedNFT.image,
            boost: selectedNFT.boostPercentage.toFixed(2)
        });
        
        // Notify parent component
        if (onAvatarChange) {
            onAvatarChange(slotIndex, selectedNFT);
        }
    };

    if (loading || isLoading) {
        return <div className="nft-box">
            <CardView className="nft-card">
                <div className="loading-placeholder">
                    <div className="loading-spinner"></div>
                </div>
            </CardView>
            <div className="name">
                Loading...
            </div>
        </div>
    }

    return (
        <>
            <div className="nft-box clickable" onClick={handleClick}>
                <CardView className="nft-card">
                    {!avatar || avatar.isEmpty ? (
                        <img src="/images/avatars/avatar-left-placeholder.png" alt="empty slot"></img>
                    ) : (
                        <img 
                            src={nftData?.image || `/images/avatars/character-${avatar.tokenId}.png`} 
                            alt={`Character ${avatar.tokenId}`}
                            onError={(e) => {
                                // Fallback to placeholder if specific character image doesn't exist
                                e.target.src = "/images/avatars/avatar-left-placeholder.png";
                            }}
                        />
                    )}
                </CardView>
                <div className="name">
                    {!avatar || avatar.isEmpty ? 'Empty' : (nftData ? nftData.name : `Character #${avatar.tokenId}`)}
                </div>
            </div>
            
            {showSelector && (
                <BoostNFTSelector
                    onClose={() => setShowSelector(false)}
                    onSelect={handleNFTSelect}
                    slotIndex={slotIndex}
                    equippedAvatars={allAvatars}
                />
            )}
        </>
    )
}

export default NFTBox;