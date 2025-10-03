"use client";
import { IoWalletOutline } from "react-icons/io5";
import { IoMdTrendingDown, IoMdTrendingUp } from "react-icons/io";
export default function Wallet() {
  return (
      <div className="wallet-container">
        <div className="sub-wallet-container">

          {/* Wallet Card */}
          <div className="relative max-w-sm mx-auto shadow-lg rounded-2xl p-5 bg-card border border-white/10 hover:scale-105 transition-transform duration-300">
            <header className="flex items-center gap-2 mb-3">
              <IoWalletOutline className="text-primary w-5 h-5" />
              <h3 className="text-lg font-semibold">Your Wallet</h3>
            </header>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Coins</span>
                <span className="font-semibold">250 Gleam Coins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Balance</span>
                <span className="font-semibold">₦12,500</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
