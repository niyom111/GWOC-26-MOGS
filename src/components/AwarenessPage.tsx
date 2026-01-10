
import React from 'react';
import { motion as motionBase } from 'framer-motion';
import { Page } from '../types';

// Fix for framer-motion type mismatch in the current environment
const motion = motionBase as any;

const awarenessBlocks = [
  {
    title: "Why Only Robusta?",
    subtitle: "The Caffeine payload & The Sourcing",
    body: "We reclaim the bean the world ignored. Robusta provides twice the antioxidant load and caffeine payoff of Arabica. Our beans are sourced exclusively from high-altitude estates in Vietnam and India, where pressure and climate craft an uncompromising profile.",
    img: "/media/rabuste1.jpeg",
  },
  {
    title: "The Trifecta",
    subtitle: "Coffee, Art, Community",
    body: "A café is a sanctuary, not just a service. We built Rabuste to be the collision point of coffee, fine art, and shared learning—where caffeine, conversation, and creativity blend.",
    img: "/media/rabuste2.jpeg",
  },
];

interface AwarenessPageProps {
  onNavigate: (page: Page) => void;
}

const AwarenessPage: React.FC<AwarenessPageProps> = ({ onNavigate }) => {
  const handleNavigate = (page: Page) => {
    onNavigate(page);
  };

  return (
    <div className="pt-24 md:pt-32 pb-40 px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 md:mb-16 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.5em] text-zinc-500 mb-4 font-sans"
          >
            Our Philosophy
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-serif italic tracking-tight leading-none"
          >
            More Than A Buzz.
          </motion.h1>
          <p className="mt-6 text-sm md:text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed uppercase tracking-widest text-balance">
            Rabuste exists for people who treat energy, art, and time as sacred resources. This is where discipline
            meets decadence—where every shot pulled and every brushstroke on the wall has intent&nbsp;it.
          </p>
        </header>

        {/* The Name */}
        <section className="mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-serif italic tracking-tight text-[#1A1A1A]">
            The Name: <span className="underline decoration-zinc-400/60">Rabuste</span>
          </h2>
          <p className="text-sm md:text-base text-zinc-700 leading-relaxed">
            "Rabuste" is a deliberate distortion of <span className="font-semibold">Robusta</span>—our nod to strength,
            resilience, and the ability to hold your own under pressure. Where others softened coffee into comfort,
            we lean into its power. The name is a declaration that intensity is not something to be diluted; it is
            something to be refined.
          </p>
        </section>

        {/* The Why – Only Robusta */}
        <section className="mb-20 grid gap-10 md:grid-cols-3">
          <div className="md:col-span-3 mb-4">
            <h2 className="text-3xl md:text-4xl font-serif italic tracking-tight text-[#1A1A1A] mb-4">
              The Why: A Choice, Not an Alternative.
            </h2>
            <p className="text-sm md:text-base text-zinc-700 leading-relaxed">
              Rabuste is built on a singular conviction: <span className="font-semibold">Robusta is not inferior; it is
                misunderstood.</span> For decades, the conversation has centered on Arabica as the default for "good"
              coffee. We intentionally stepped off that path. By sourcing only high-grade, traceable Robusta, we unlock
              a flavor spectrum that is deeper, darker, and unapologetically bold.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm uppercase tracking-[0.4em] text-zinc-500">Caffeine</h3>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Robusta carries roughly <span className="font-semibold">twice the caffeine</span> of Arabica. It is not a
              jittery rush—it is a deliberate surge, tuned for early studio mornings, double shifts, and late-night
              edits. We design our extractions to deliver power without the crash.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm uppercase tracking-[0.4em] text-zinc-500">Boldness</h3>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Where others chase sweetness, we chase <span className="font-semibold">structure and depth</span>.
              Robusta brings notes of dark cacao, roasted spice, and earth—flavors that cut through milk, sugar, and
              long nights. It is the backbone of our menu, not a filler.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm uppercase tracking-[0.4em] text-zinc-500">Crema</h3>
            <p className="text-sm text-zinc-700 leading-relaxed">
              A true Robusta shot blooms with a <span className="font-semibold">thick, persistent crema</span> that holds
              its structure. It is visual proof of density, extraction, and care. We celebrate that texture—it is the
              surface tension that tells you something powerful is happening underneath.
            </p>
          </div>
        </section>

        {/* The Trifecta */}
        <section className="mb-20 space-y-6">
          <h2 className="text-3xl md:text-4xl font-serif italic tracking-tight text-[#1A1A1A]">
            The Trifecta: Coffee, Art, Workshops.
          </h2>
          <p className="text-sm md:text-base text-zinc-700 leading-relaxed">
            Rabuste is not just a café—it is a <span className="font-semibold">studio for the senses</span>. Every shop
            is built on a three-part architecture: the bar, the wall, and the circle.
          </p>
          <ul className="space-y-4 text-sm md:text-base text-zinc-700 leading-relaxed list-disc list-inside">
            <li>
              <span className="font-semibold">Coffee</span> — High-grade Robusta, precision roasted and dialed in for
              clarity, intensity, and ritual. We obsess over water, grind, and temperature so you can focus on the
              work, the conversation, or the quiet.
            </li>
            <li>
              <span className="font-semibold">Fine Art</span> — Our walls function as living galleries. Rotating
              exhibitions turn the café into a visual journal of the city: paintings, prints, installations, and
              photography that mirror the energy of the bar.
            </li>
            <li>
              <span className="font-semibold">Workshops</span> — From sensory labs to creative sprints, our calendar is
              a constantly shifting syllabus. We believe that education should feel less like school and more like
              collaboration.
            </li>
          </ul>
        </section>

        {/* Existing visual storytelling blocks */}
        <section className="space-y-60">
          {awarenessBlocks.map((block, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-20`}
            >
              <motion.div
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                className={`md:w-1/2 ${block.title === 'Why Only Robusta?' ? 'md:translate-x-16 lg:translate-x-24 xl:translate-x-32' : ''}`}
              >
                <div className="aspect-[4/5] overflow-hidden transition-all duration-1000 group">
                  <img src={block.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={block.title} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: idx % 2 === 0 ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                className="md:w-1/2 space-y-8"
              >
                <span className="text-[10px] uppercase tracking-[0.5em] text-zinc-400 block italic">{block.subtitle}</span>
                <h2 className="text-5xl md:text-7xl font-serif italic tracking-tighter leading-[0.9]">
                  {block.title}
                </h2>
                <p className="text-lg font-sans text-zinc-600 leading-relaxed uppercase tracking-wider">
                  {block.body}
                </p>
                <button
                  onClick={() =>
                    block.title === 'Why Only Robusta?'
                      ? handleNavigate(Page.ROBUSTA_STORY)
                      : block.title === 'The Trifecta'
                        ? handleNavigate(Page.ART)
                        : undefined
                  }
                  className="group relative pt-6 flex items-center space-x-6 text-[11px] uppercase tracking-[0.4em] font-bold"
                >
                  <span>{block.title === 'The Trifecta' ? 'View Art Collection' : 'Read Full Story'}</span>
                  <motion.div className="w-12 h-px bg-black group-hover:w-20 transition-all" />
                </button>
              </motion.div>
            </div>
          ))}
        </section>

      </div>
    </div>
  );
};

export default AwarenessPage;
