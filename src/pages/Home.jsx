
import React from "react";
import {
  FiArrowRight,
  FiAward,
  FiTarget,
  FiZap,
} from "react-icons/fi";
import Header from "../components/Header";
import Button from "../components/Button";
import bannerImage from "../assets/img1.jpg";

const features = [
  {
    icon: FiTarget,
    title: "Own the innings",
    description: "Build your score one delivery at a time.",
  },
  {
    icon: FiZap,
    title: "Choose your shot",
    description: "Balance scoring opportunities against wicket risk.",
  },
  {
    icon: FiAward,
    title: "Beat the target",
    description: "Manage your wickets, overs, and run rate.",
  },
];

export default function Home({ nextPage }) {
  return (
    <main className="stadium-background min-h-screen">
      <Header />

      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-20">
          <img
            src={bannerImage}
            alt=""
            className="h-full min-h-[610px] w-full object-cover opacity-30"
          />
        </div>

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-main via-main/90 to-main/45" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-main via-transparent to-main/30" />

        <div className="mx-auto grid min-h-[590px] max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
          <div className="max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              The next ball changes everything
            </div>

            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-primary">
              Welcome to SCricket
            </p>

            <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Play smart.
              <br />
              <span className="gold-text">Score big.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-tsecondary sm:text-lg">
              Read the situation, choose your batting approach, protect your
              wickets, and chase your target. Every delivery matters.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button size="xl" className="w-auto" onClick={nextPage}>
                Start a match <FiArrowRight />
              </Button>

              <span className="text-sm text-tmuted">
                Single-player cricket
              </span>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-tsecondary">
              <span>01 / Set your target</span>
              <span>02 / Pick your shots</span>
              <span>03 / Win the match</span>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="glass-panel relative mx-auto max-w-sm overflow-hidden rounded-3xl p-6">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

              <div className="relative flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-tmuted">
                  Match centre
                </span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  READY
                </span>
              </div>

              <div className="relative mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-widest text-tmuted">
                  Your innings
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">00</span>
                  <span className="text-xl font-bold text-tmuted">/ 00</span>
                </div>
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[8%] rounded-full bg-primary" />
                </div>
                <div className="mt-3 flex justify-between text-xs text-tmuted">
                  <span>Overs progress</span>
                  <span>Ball by ball</span>
                </div>
              </div>

              <div className="relative mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <FiTarget className="mb-3 text-xl text-secondary" />
                  <p className="text-xs text-tmuted">Match objective</p>
                  <p className="mt-1 font-bold text-white">Chase the target</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <FiZap className="mb-3 text-xl text-primary" />
                  <p className="text-xs text-tmuted">Your strategy</p>
                  <p className="mt-1 font-bold text-white">Play your way</p>
                </div>
              </div>

              <p className="relative mt-5 text-center text-xs text-tmuted">
                One delivery at a time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-10">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Built for every innings
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            More than just hitting the ball.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }, index) => (
            <article
              key={title}
              className="rounded-2xl border border-white/10 bg-card/70 p-6 transition-colors hover:border-primary/30"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <Icon className="text-xl text-primary" />
              </div>
              <p className="mb-2 text-xs font-bold tracking-widest text-tmuted">
                0{index + 1}
              </p>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-tsecondary">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
