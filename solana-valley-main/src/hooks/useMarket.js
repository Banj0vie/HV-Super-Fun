import { createTransferInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import { Transaction } from "@solana/web3.js";
import { useCallback, useState } from "react";

import {
  batchBuyItems as batchBuyItemsApi,
  cancelListing as cancelListingApi,
  getListing as getListingApi,
  getListings as getListingsApi,
  listItem as listItemApi,
  purchaseItem as purchaseItemApi,
  sendItem as sendItemApi,
} from "../api/marketApi";
import { GAME_TOKEN_MINT, TOKEN_DECIMALS, TRESURY_WALLET } from "../solana/constants/programId";
import { useSolanaWallet } from "./useSolanaWallet";

const TOKEN_SCALE = 10 ** TOKEN_DECIMALS;

export const useMarket = () => {
  const { publicKey, sendTransaction, connection, account } = useSolanaWallet();
  const [marketData, setMarketData] = useState({
    listings: [],
    totalListings: 0,
    totalSales: 0,
    totalVolume: 0,
    nextId: 0,
    loading: false,
    error: null,
  });

  const getAllListings = useCallback(async () => {
    setMarketData(prev => ({ ...prev, loading: true, error: null }));
    try {
      const listings = await getListingsApi();
      const formattedListings = (listings || [])
        .filter(l => l.active)
        .map(l => ({
          lid: l.listingId,
          seller: l.sellerWallet || "",
          id: Number(l.itemId || 0),
          amount: Number(l.amount || 0),
          pricePer: Number(l.pricePer || 0) / TOKEN_SCALE,
          active: !!l.active,
        }));

      setMarketData(prev => ({
        ...prev,
        listings: formattedListings,
        totalListings: listings.length,
        loading: false,
      }));
      return formattedListings;
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || "Failed to fetch listings";
      setMarketData(prev => ({ ...prev, loading: false, error: message }));
      return [];
    }
  }, []);

  const purchase = useCallback(
    async (lid, amount) => {
      if (!publicKey || !account) {
        throw new Error("Wallet not connected");
      }
      if (marketData.loading) {
        throw new Error("Transaction already in progress");
      }
      setMarketData(prev => ({ ...prev, loading: true, error: null }));
      try {
        // Fetch listing to get the price
        const listing = await getListingApi(lid.toString());
        if (!listing || !listing.active) {
          throw new Error("Listing not found or inactive");
        }

        const pricePer = BigInt(listing.pricePer);
        const totalCost = pricePer * BigInt(amount);

        // Build SPL token transfer from user to treasury
        const fromAta = await getAssociatedTokenAddress(GAME_TOKEN_MINT, publicKey, false);
        const toAta = await getAssociatedTokenAddress(GAME_TOKEN_MINT, TRESURY_WALLET, false);
        const transferIx = createTransferInstruction(fromAta, toAta, publicKey, totalCost);

        const tx = new Transaction().add(transferIx);
        tx.feePayer = publicKey;
        const { blockhash } = await connection.getLatestBlockhash("finalized");
        tx.recentBlockhash = blockhash;

        const txSignature = await sendTransaction(tx, connection);
        await connection.confirmTransaction(txSignature, "confirmed");

        // Call backend to complete purchase
        const resp = await purchaseItemApi({
          wallet: account,
          txSignature,
          listingId: lid.toString(),
          amount: Number(amount),
        });

        if (!resp?.ok) throw new Error(resp?.error || "Failed to purchase");

        return { txHash: txSignature, purchased: resp.purchased };
      } catch (error) {
        const message = error?.response?.data?.error || error?.message || "Failed to purchase";
        setMarketData(prev => ({ ...prev, error: message }));
        throw new Error(message);
      } finally {
        setMarketData(prev => ({ ...prev, loading: false }));
      }
    },
    [publicKey, account, connection, sendTransaction, marketData.loading]
  );

  const list = useCallback(
    async (id, amount, pricePer) => {
      if (!account) {
        throw new Error("Wallet not connected");
      }
      if (marketData.loading) {
        throw new Error("Transaction already in progress");
      }
      setMarketData(prev => ({ ...prev, loading: true, error: null }));
      try {
        // Convert price to base units
        const pricePerLamports = BigInt(Math.floor(pricePer * TOKEN_SCALE)).toString();

        const resp = await listItemApi({
          wallet: account,
          itemId: Number(id),
          amount: Number(amount),
          pricePer: pricePerLamports,
        });

        if (!resp?.ok) throw new Error(resp?.error || "Failed to list item");

        return { txHash: "backend", listingId: resp.listingId };
      } catch (error) {
        const message = error?.response?.data?.error || error?.message || "Failed to list item";
        setMarketData(prev => ({ ...prev, error: message }));
        throw new Error(message);
      } finally {
        setMarketData(prev => ({ ...prev, loading: false }));
      }
    },
    [account, marketData.loading]
  );

  const cancel = useCallback(
    async lid => {
      if (!account) {
        throw new Error("Wallet not connected");
      }
      if (marketData.loading) {
        throw new Error("Transaction already in progress");
      }
      setMarketData(prev => ({ ...prev, loading: true, error: null }));
      try {
        const resp = await cancelListingApi({
          wallet: account,
          listingId: lid.toString(),
        });

        if (!resp?.ok) throw new Error(resp?.error || "Failed to cancel listing");

        return { txHash: "backend", refundedAmount: resp.refundedAmount };
      } catch (error) {
        const message = error?.response?.data?.error || error?.message || "Failed to cancel listing";
        setMarketData(prev => ({ ...prev, error: message }));
        throw new Error(message);
      } finally {
        setMarketData(prev => ({ ...prev, loading: false }));
      }
    },
    [account, marketData.loading]
  );

  const batchBuy = useCallback(
    async (id, maxPricePer, totalBudget) => {
      if (!publicKey || !account) {
        throw new Error("Wallet not connected");
      }
      if (marketData.loading) {
        throw new Error("Transaction already in progress");
      }
      setMarketData(prev => ({ ...prev, loading: true, error: null }));
      try {
        // Convert to base units
        const maxPricePerLamports = BigInt(Math.floor(maxPricePer * TOKEN_SCALE));
        const totalBudgetLamports = BigInt(Math.floor(totalBudget * TOKEN_SCALE));

        // Build SPL token transfer from user to treasury for total budget
        const fromAta = await getAssociatedTokenAddress(GAME_TOKEN_MINT, publicKey, false);
        const toAta = await getAssociatedTokenAddress(GAME_TOKEN_MINT, TRESURY_WALLET, false);
        const transferIx = createTransferInstruction(fromAta, toAta, publicKey, totalBudgetLamports);

        const tx = new Transaction().add(transferIx);
        tx.feePayer = publicKey;
        const { blockhash } = await connection.getLatestBlockhash("finalized");
        tx.recentBlockhash = blockhash;

        const txSignature = await sendTransaction(tx, connection);
        await connection.confirmTransaction(txSignature, "confirmed");

        // Call backend to complete batch buy
        const resp = await batchBuyItemsApi({
          wallet: account,
          txSignature,
          itemId: Number(id),
          maxPricePer: maxPricePerLamports.toString(),
          totalBudget: totalBudgetLamports.toString(),
        });

        if (!resp?.ok) throw new Error(resp?.error || "Failed to batch buy");

        return { txHash: txSignature, totalPurchased: resp.totalPurchased, totalSpent: resp.totalSpent };
      } catch (error) {
        const message = error?.response?.data?.error || error?.message || "Failed to batch buy";
        setMarketData(prev => ({ ...prev, error: message }));
        throw new Error(message);
      } finally {
        setMarketData(prev => ({ ...prev, loading: false }));
      }
    },
    [publicKey, account, connection, sendTransaction, marketData.loading]
  );

  const send = useCallback(
    async (id, to, amount) => {
      if (!account) {
        throw new Error("Wallet not connected");
      }
      if (marketData.loading) {
        throw new Error("Transaction already in progress");
      }
      setMarketData(prev => ({ ...prev, loading: true, error: null }));
      try {
        const resp = await sendItemApi({
          wallet: account,
          recipientWallet: to,
          itemId: Number(id),
          amount: Number(amount),
        });

        if (!resp?.ok) throw new Error(resp?.error || "Failed to send item");

        return { txHash: "backend", sent: resp.sent };
      } catch (error) {
        const message = error?.response?.data?.error || error?.message || "Failed to send item";
        setMarketData(prev => ({ ...prev, error: message }));
        throw new Error(message);
      } finally {
        setMarketData(prev => ({ ...prev, loading: false }));
      }
    },
    [account, marketData.loading]
  );

  return { marketData, getAllListings, purchase, list, cancel, batchBuy, send };
};
