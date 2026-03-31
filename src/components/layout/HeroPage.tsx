import Link from 'next/link';
import Image from 'next/image';

export default function HeroPage() {
  return (
    <div className="antialiased selection:bg-primary/30 min-h-screen flex flex-col bg-surface-dim">
      {/* TopAppBar */}
      <nav className="fixed top-0 w-full flex justify-between items-center px-8 py-6 max-w-none bg-[#0f131c]/80 backdrop-blur-xl z-50">
        <div className="text-2xl font-serif italic tracking-tighter text-[#dfe2ee]">LEXIQ</div>
        <div className="hidden md:flex items-center space-x-12">
          <span className="text-[#dfe2ee]/60 font-sans text-sm uppercase tracking-widest hover:text-[#acc7ff] transition-colors duration-300 cursor-not-allowed">
            Dictionary
          </span>
          <span className="text-[#dfe2ee]/60 font-sans text-sm uppercase tracking-widest hover:text-[#acc7ff] transition-colors duration-300 cursor-not-allowed">
            Library
          </span>
          <span className="text-[#dfe2ee]/60 font-sans text-sm uppercase tracking-widest hover:text-[#acc7ff] transition-colors duration-300 cursor-not-allowed">
            Mastery
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <Link
            href="/login"
            className="text-[#dfe2ee]/60 font-sans text-sm uppercase tracking-widest hover:text-[#acc7ff] transition-colors duration-300 active:opacity-80 active:scale-95"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-xl font-bold text-sm tracking-tight hover:brightness-110 active:scale-95 transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6">
        {/* Background Textures */}
        <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none"></div>
        <div className="absolute inset-0 hero-glow pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl w-full text-center">
          {/* Mastery Chip */}
          <div className="mb-12 inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/10">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-primary font-sans text-[10px] font-bold uppercase tracking-[0.2em]">
              Word of the Day
            </span>
          </div>

          {/* The Hero Word */}
          <div className="relative inline-block mb-4">
            <h1 className="text-8xl md:text-[10rem] font-serif italic tracking-tighter leading-none text-on-background drop-shadow-2xl">
              ephemeral
            </h1>
            {/* Subtle underglow */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4/5 h-12 bg-primary/20 blur-[60px] pointer-events-none"></div>
          </div>

          {/* Phonetic & Meta */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-12 opacity-80">
            <span className="font-sans text-xl text-on-surface-variant italic">/ɪˈfem.ər.əl/</span>
            <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-highest transition-colors group">
              <span
                className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform"
                data-icon="volume_up"
              >
                volume_up
              </span>
            </button>
            <span className="px-3 py-1 rounded-lg bg-surface-container-high text-on-surface-variant font-sans text-xs font-bold uppercase tracking-widest">
              adjective
            </span>
          </div>

          {/* Definition */}
          <div className="max-w-xl mx-auto mb-16">
            <p className="text-2xl md:text-3xl font-sans font-light text-on-surface leading-relaxed tracking-tight">
              Lasting for a very short time; transitory.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link
              href="/signup"
              className="group relative px-10 py-5 bg-primary-container text-on-primary-container rounded-xl font-bold text-lg tracking-tight hover:brightness-110 transition-all active:scale-95 flex items-center gap-3"
            >
              Get Started Free
              <span
                className="material-symbols-outlined transition-transform group-hover:translate-x-1"
                data-icon="arrow_forward"
              >
                arrow_forward
              </span>
            </Link>
            <button className="px-10 py-5 bg-surface-container-high text-on-surface rounded-xl font-bold text-lg tracking-tight hover:bg-surface-container-highest transition-all active:scale-95">
              See how it works
            </button>
          </div>
        </div>

        {/* Floating Decorative Element (Abstract Imagery) */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 opacity-20 hidden lg:block">
          <Image
            alt="Abstract aesthetic"
            className="w-full h-full object-cover rounded-full mix-blend-screen grayscale"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyEomVcfOJrRapZwznyafWNxeVLFuqlNB_40tYCPfqi7bnZ3nYEZwjUs0mr-9rJZU99fvOthM5uFKrPO8ybglTXRSo-24MA3hnVf62AJDMR291Kc0-f-W840RcvugycGOEGtcHi73ptAs20DVXAhyrgM3uT3W9pNDV9zhsqCe-XkLkWig9HAGv0gd_EO5bp8cVkzOUk1EB9sktqWaUFF0kglShbR76FRAeV_eT14NP8WD5DGL2m63ptoKOcNQrMLuF2HgAzUTXmg"
            width={256}
            height={256}
          />
        </div>
      </main>

      {/* Bottom Social Proof Bar (BottomNavBar Proxy) */}
      <div className="fixed bottom-0 left-0 w-full flex justify-around items-center py-6 px-12 bg-[#1c2028] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50">
        <div className="flex flex-col items-center justify-center text-[#dfe2ee]/40 group cursor-default">
          <span
            className="material-symbols-outlined mb-1 group-hover:text-primary transition-colors"
            data-icon="menu_book"
          >
            menu_book
          </span>
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em]">
            12.4k Words
          </span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#acc7ff] cursor-default">
          <span
            className="material-symbols-outlined mb-1 text-orange-400 animate-pulse"
            data-icon="local_fire_department"
          >
            local_fire_department
          </span>
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em]">
            14 Day Streak
          </span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#dfe2ee]/40 group cursor-default">
          <span
            className="material-symbols-outlined mb-1 group-hover:text-primary transition-colors"
            data-icon="insights"
          >
            insights
          </span>
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em]">
            85% Mastery
          </span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#dfe2ee]/40 group cursor-default">
          <span
            className="material-symbols-outlined mb-1 group-hover:text-primary transition-colors"
            data-icon="military_tech"
          >
            military_tech
          </span>
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em]">
            Global Rank
          </span>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
    </div>
  );
}
