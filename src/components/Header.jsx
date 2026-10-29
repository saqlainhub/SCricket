
import React from "react";
import { GiCricketBat } from "react-icons/gi";
import Logo from "../assets/logo1.png";

export default function Header() {
  return (
    <header className="relative z-20 border-b border-white/10 bg-main/90 backdrop-blur-xl">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <a
          href="#home"
          className="flex items-center gap-3"
          aria-label="SCricket home"
        >
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-primary/20 bg-primary/10">
            <img
              src={Logo}
              alt=""
              className="h-full w-full object-contain"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
            <GiCricketBat className="hidden text-2xl text-primary" />
          </div>

          <div>
            <p className="text-lg font-black tracking-[0.16em] text-white">
              SCRICKET<span className="text-secondary">.</span>
            </p>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-tmuted">
              Your game. Your innings.
            </p>
          </div>
        </a>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 sm:inline-flex">
            <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
            SINGLE PLAYER
          </span>

          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-secondary/40 bg-secondary/10 text-sm font-bold text-secondary">
            S
          </div>
        </div>
      </nav>
    </header>
  );
}
