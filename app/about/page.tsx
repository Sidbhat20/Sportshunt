import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarCheck, Flag, MapPin, SoccerBall, Trophy, UsersThree, WhatsappLogo } from '@phosphor-icons/react/dist/ssr';
import { PublicHeader } from '@/components/layouts/public-header';
import { PublicFooter } from '@/components/layouts/public-footer';
import { Reveal, RevealImage, Stagger, StaggerItem } from '@/components/motion/primitives';
import { WebGLPlayfield } from '@/components/motion/webgl-playfield';

export const metadata: Metadata = {
  title: 'About Sportshunt | Built for Local Sport',
  description: 'Meet the team building a simpler way to find games, book venues, and run local tournaments.',
};

const JOURNEY = [
  { number: '01', icon: SoccerBall, title: 'Find your game', copy: 'See open games nearby and know exactly how many players are still needed.' },
  { number: '02', icon: CalendarCheck, title: 'Book the ground', copy: 'Compare real venues, choose a time, and reserve without endless calls or group messages.' },
  { number: '03', icon: Trophy, title: 'Build the scene', copy: 'Give organizers and referees practical tools to run better local competition.' },
];

const TEAM = [
  { name: 'Siddharth Bhat', image: '/team/siddharth-bhat.png', role: 'Product & technology', quote: 'Local sport deserves software that feels as energetic as the game itself.' },
  { name: 'Sabari K', image: '/team/sabari-k.png', role: 'Operations & community', quote: 'The best sports communities begin when showing up becomes easier.' },
];

export default function AboutPage() {
  return (
    <>
      <PublicHeader />
      <main id="main-content" className="overflow-hidden bg-white">
        <WebGLPlayfield className="relative overflow-hidden border-b-2 border-ink bg-ink text-white" canvasClassName="opacity-80" contentClassName="relative">
          <div className="pitch-grid pointer-events-none absolute inset-0 opacity-20" />
          <div className="pointer-events-none absolute -right-[5vw] top-0 select-none font-display text-[34vw] leading-none text-white/[0.035]">US</div>
          <section className="mx-auto grid min-h-[calc(100dvh-72px)] max-w-7xl items-end gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.25fr_0.75fr] lg:items-center lg:px-8 lg:py-20">
            <Reveal className="relative z-10 max-w-4xl" y={24}>
              <div className="mb-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.24em] text-lime"><span className="h-px w-12 bg-lime" /> Born in Bengaluru</div>
              <h1 className="display max-w-[10ch] font-display text-[clamp(4rem,13vw,9rem)] leading-[0.82] text-white">
                Local sport should be easier to play.
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/65 sm:text-lg">
                Sportshunt brings players, venues, and organizers into one connected local sports network.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/games" className="lime-btn">Find a game <ArrowRight size={18} weight="bold" /></Link>
                <Link href="/turfs" className="inline-flex min-h-12 items-center justify-center border border-white/30 px-6 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:border-white hover:bg-white hover:text-ink">Explore venues</Link>
              </div>
            </Reveal>

            <Reveal className="relative z-10 lg:pb-7" delay={0.12}>
              <div className="ml-auto max-w-sm border-l border-white/20 pl-6 sm:pl-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Why we exist</p>
                <p className="mt-4 text-2xl font-semibold leading-tight text-white sm:text-3xl">
                  Too many games die inside chats, missed calls, and “maybe next week.”
                </p>
                <div className="mt-8 flex items-center gap-3 border-t border-white/15 pt-5 text-sm text-white/55"><MapPin size={19} weight="fill" className="text-lime" /> Building from the city we play in.</div>
              </div>
            </Reveal>
          </section>
        </WebGLPlayfield>

        <section className="border-b border-line bg-lime">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p className="display font-display text-2xl text-ink sm:text-3xl">Your city. Your game. Go hunt.</p>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-ink/65"><Flag size={17} weight="fill" /> A player-first mission</div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <Reveal className="max-w-4xl">
            <h2 className="display font-display text-5xl leading-[0.9] text-ink sm:text-7xl lg:text-8xl">Not another sports directory.</h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">We are designing the operating layer for everyday sport: discovery when you want to play, confidence when you book, and structure when you compete.</p>
          </Reveal>

          <Stagger className="mt-14 grid border-y-2 border-ink md:grid-cols-3" stagger={0.12}>
            {JOURNEY.map((item, index) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={item.title} className={`relative min-h-72 p-6 sm:p-8 ${index > 0 ? 'border-t-2 border-ink md:border-l-2 md:border-t-0' : ''} ${index === 1 ? 'bg-accent text-white' : 'bg-white text-ink'}`}>
                  <div className="flex items-start justify-between">
                    <Icon size={34} weight="bold" className={index === 1 ? 'text-lime' : 'text-accent'} />
                    <span className={`scoreboard text-5xl ${index === 1 ? 'text-white/15' : 'text-ink/10'}`}>{item.number}</span>
                  </div>
                  <div className="mt-20">
                    <h3 className={`display font-display text-3xl ${index === 1 ? 'text-white' : 'text-ink'}`}>{item.title}</h3>
                    <p className={`mt-3 text-sm leading-6 ${index === 1 ? 'text-white/70' : 'text-muted'}`}>{item.copy}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </section>

        <section className="bg-canvasAlt py-20 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="max-w-3xl">
              <p className="text-sm font-bold text-accent">The people on the other side of the screen</p>
              <h2 className="display mt-4 font-display text-5xl leading-[0.9] text-ink sm:text-7xl">Small team. Serious about play.</h2>
            </Reveal>

            <div className="mt-14 grid gap-6 lg:grid-cols-2">
              {TEAM.map((member, index) => (
                <article key={member.name} className="group grid overflow-hidden border-2 border-ink bg-white sm:grid-cols-[0.9fr_1.1fr]">
                  <div className="relative min-h-[360px] overflow-hidden bg-ink sm:min-h-[500px]">
                    <RevealImage src={member.image} alt={`${member.name}, ${member.role} at Sportshunt`} className="absolute inset-0 h-full w-full" imgClassName="h-full w-full object-cover object-top grayscale transition duration-700 group-hover:scale-[1.03] group-hover:grayscale-0" />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/70 to-transparent" />
                    <span className="absolute bottom-4 left-4 scoreboard text-6xl text-lime">0{index + 1}</span>
                  </div>
                  <div className="flex flex-col justify-between p-6 sm:p-8">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">{member.role}</p>
                      <h3 className="display mt-3 font-display text-4xl text-ink">{member.name}</h3>
                    </div>
                    <blockquote className="mt-16 border-t border-ink/15 pt-6 text-xl font-semibold leading-snug text-ink">“{member.quote}”</blockquote>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-accent text-white">
          <div className="pointer-events-none absolute -bottom-[0.25em] right-0 font-display text-[30vw] leading-none text-white/[0.05]">GO</div>
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8 lg:py-28">
            <div className="max-w-3xl">
              <UsersThree size={38} weight="fill" className="text-lime" />
              <h2 className="display mt-6 font-display text-5xl leading-[0.9] text-white sm:text-7xl">Help shape the next game.</h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/70">Have a venue, tournament, community, or idea that belongs on Sportshunt? Talk to the team directly.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a href="https://wa.me/919148751879" className="lime-btn min-h-12"><WhatsappLogo size={19} weight="fill" /> WhatsApp us</a>
              <a href="mailto:contact@sportshunt@gmail.com" className="inline-flex min-h-12 items-center justify-center border border-white/40 px-6 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-accent">Email the team</a>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
