import React, { useEffect, useState } from "react";
import { FiArrowRight, FiActivity, FiTarget, FiZap } from "react-icons/fi";
import Button from "../components/Button";
import bannerImage from "../assets/img4.jpg";
import profileImage from "../assets/profile.jpg";

export default function Home({ nextPage }) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressTimer;
    let finishTimer;
    let cancelled = false;

    const startTime = Date.now();
    const minimumLoadingTime = 1800;

    const updateProgress = () => {
      setProgress((current) => {
        if (current >= 90) return current;
        return Math.min(current + Math.ceil((90 - current) * 0.16), 90);
      });
    };

    progressTimer = window.setInterval(updateProgress, 120);

    const finishLoading = () => {
      const remaining = Math.max(0, minimumLoadingTime - (Date.now() - startTime));
      finishTimer = window.setTimeout(() => {
        if (cancelled) return;
        setProgress(100);
        window.setTimeout(() => {
          if (!cancelled) setIsLoading(false);
        }, 280);
      }, remaining);
    };

    // Preload both images before revealing the home screen.
    let imagesToLoad = 2;
    const onImageReady = () => {
      imagesToLoad -= 1;
      if (imagesToLoad === 0) finishLoading();
    };

    [bannerImage, profileImage].forEach((src) => {
      const image = new Image();
      image.onload = onImageReady;
      image.onerror = onImageReady;
      image.src = src;
      if (image.complete) onImageReady();
    });

    return () => {
      cancelled = true;
      window.clearInterval(progressTimer);
      window.clearTimeout(finishTimer);
    };
  }, []);

  if (isLoading) {
    return (
      <main className="fixed inset-0 z-50 flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#07130f] px-6 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/[0.08] blur-[100px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#07130f_72%)]" />
        </div>

        <div className="relative flex w-full max-w-xs flex-col items-center text-center">
          <div className="relative mb-7">
            <div className="absolute -inset-2 rounded-full border border-amber-300/30 animate-[spin_8s_linear_infinite]" />
            <div className="absolute -inset-4 rounded-full border border-white/10" />
            <img
              src={profileImage}
              alt="Your profile"
              className="h-28 w-28 rounded-full border-2 border-amber-300/80 object-cover shadow-[0_0_45px_rgba(251,191,36,0.16)]"
            />
            <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-[3px] border-[#07130f] bg-emerald-400" />
          </div>

          <p className="text-[11px] font-bold uppercase tracking-[0.38em] text-amber-300">
            Welcome to
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-[0.08em] text-white">
            SCRICKET
          </h1>
          <p className="mt-2 text-sm text-white/45">Preparing your game...</p>

          <div className="mt-9 w-full">
            <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
              <span>Loading experience</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-300 transition-[width] duration-200 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 isolate flex h-[100dvh] min-h-[520px] w-full flex-col overflow-hidden bg-[#07130f] text-white">
      {/* Full-bleed cricket ground */}
      <div className="pointer-events-none absolute inset-0 -z-20">
        <img
          src={bannerImage}
          alt=""
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#04100b]/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#04100b]/65 via-[#04100b]/25 to-[#04100b]/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#04100b]/45 via-transparent to-[#04100b]/45" />
      </div>

      {/* Small game-style top bar */}
      <header className="relative z-10 flex w-full items-center justify-between px-5 py-5 sm:px-9 sm:py-7">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-300/40 bg-black/30 text-sm font-black text-amber-300 shadow-lg backdrop-blur">
            
            <img
              src={profileImage}
              alt="Your profile"
              className="rounded border-2 "
            />
          </div>
          <div>
            <p className="text-sm font-black tracking-[0.18em] text-white">SCRICKET</p>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/50">
              Cricket game
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-emerald-300/25 bg-black/30 px-3 py-2 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,0.9)]" />
          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-100 sm:text-[10px]">
            Match ready
          </span>
        </div>
      </header>

      {/* Main game welcome */}
      <section className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-5 pb-8 text-center sm:px-8">
        <div className="mb-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.32em] text-amber-300 sm:mb-7 sm:text-xs">
          <span className="h-px w-7 bg-amber-300/70" />
          Step onto the pitch
          <span className="h-px w-7 bg-amber-300/70" />
        </div>

        <h1 className="text-[clamp(3.6rem,11vw,8rem)] font-black leading-[0.84] tracking-[-0.075em] text-white drop-shadow-[0_5px_25px_rgba(0,0,0,0.45)]">
          S<span className="text-amber-300">CRICKET</span>
        </h1>

        <p className="mt-5 max-w-xl text-sm font-medium leading-6 text-white/85 drop-shadow sm:mt-7 sm:text-lg sm:leading-8">
          Every run matters. Every wicket counts.
          <span className="block text-white/65">
            Take your position and play your innings.
          </span>
        </p>

        {/* Simple cricket pitch / wicket motif */}
        <div className="relative mt-8 flex h-[76px] w-[190px] items-center justify-center sm:mt-10 sm:h-[88px] sm:w-[220px]">
          <div className="absolute bottom-0 h-12 w-full rounded-[50%] border border-white/15 bg-emerald-300/[0.07] sm:h-14" />
          <div className="absolute bottom-2 h-9 w-24 rounded-[50%] border border-amber-200/25 sm:h-10 sm:w-28" />
          <div className="absolute bottom-[17px] flex items-end gap-[5px] sm:bottom-[20px]">
            <span className="h-9 w-[5px] rounded-t-sm bg-gradient-to-b from-amber-100 to-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.25)]" />
            <span className="h-11 w-[5px] rounded-t-sm bg-gradient-to-b from-amber-100 to-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.25)]" />
            <span className="h-9 w-[5px] rounded-t-sm bg-gradient-to-b from-amber-100 to-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.25)]" />
            <span className="absolute -top-[3px] left-[-3px] h-[3px] w-[25px] rounded-full bg-amber-200" />
          </div>
        </div>

        <div className="mt-7 w-full max-w-[230px] sm:mt-8">
          <Button size="xl" className="w-full justify-center" onClick={nextPage}>
            PLAY NOW <FiArrowRight />
          </Button>
        </div>

        <div className="mt-7 flex items-center gap-4 text-[9px] font-bold uppercase tracking-[0.16em] text-white/55 sm:mt-9 sm:gap-7 sm:text-[10px]">
          <span>Bat</span>
          <span className="h-1 w-1 rounded-full bg-amber-300" />
          <span>Play</span>
          <span className="h-1 w-1 rounded-full bg-amber-300" />
          <span>Win</span>
        </div>
      </section>

      <footer className="relative z-10 flex shrink-0 items-center justify-center px-4 pb-5 sm:pb-7">
        <p className="text-[9px] font-medium uppercase tracking-[0.24em] text-white/35">
          SCricket <span className="mx-2 text-amber-300/70">•</span> Own the innings
        </p>
      </footer>
    </main>
  );
}
