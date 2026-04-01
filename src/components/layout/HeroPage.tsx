import Link from 'next/link';
import Image from 'next/image';

export default function HeroPage() {
  return (
    <div className="antialiased min-h-screen flex flex-col bg-[#050505] text-[#dfe2ee] font-sans selection:bg-primary/30 overflow-hidden relative">

      {/* Background Dark Sky & Subtle Glows */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-60 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.png')" }}
      >
        <div className="absolute inset-0 bg-[#050505]/60"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Announcement Banner */}

        {/* Top Navbar */}
        <nav className="w-full flex justify-between items-center px-6 md:px-12 py-5 max-w-[1400px] mx-auto">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Lexiq" width={32} height={32} className="opacity-90" />
            <span className="font-serif text-2xl tracking-wide font-semibold text-white">LEXIQ</span>
          </div>

          {/* Links */}
          <div className="hidden lg:flex items-center gap-10 text-[13px] font-medium text-[#adb2c4] uppercase tracking-wider">
            <Link href="/dashboard/search" className="hover:text-white hover:underline underline-offset-4 transition">Dictionary</Link>
            <Link href="/dashboard/vocabulary" className="hover:text-white hover:underline underline-offset-4 transition">Library</Link>
            <Link href="/dashboard" className="hover:text-white hover:underline underline-offset-4 transition">Mastery</Link>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/login"
              className="text-[#adb2c4] font-semibold text-sm hover:text-white transition-colors uppercase tracking-wider"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center bg-primary-container hover:brightness-110 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-glow-sm"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-10 pb-24 max-w-[1000px] mx-auto">
          {/* Top Pill badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[11px] font-bold tracking-[0.25em] text-primary uppercase">
              The Ultimate Vocabulary Platform
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-[84px] font-serif mb-6 leading-[1.15] text-[#eef0f8] drop-shadow-2xl">
            Master Language at the Bleeding Edge of AI
          </h1>

          <p className="text-base md:text-xl text-[#adb2c4] max-w-2xl mb-12 leading-relaxed">
            Discover, understand, and truly learn. Lexiq utilizes advanced spaced repetition and AI to build your personalized linguistic profile.
          </p>

          {/* Features / Powered By Section */}
          <div className="flex flex-col items-center gap-5 mb-12">
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#8e95ae] uppercase">Supercharged By</span>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14 opacity-90">
              <span className="text-lg md:text-xl font-bold flex items-center gap-2"><span className="material-symbols-outlined text-primary text-3xl">psychology</span> Smart Repetition</span>
              <span className="text-lg md:text-xl font-bold flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-3xl">menu_book</span> Deep Definitions</span>
              <span className="text-lg md:text-xl font-bold flex items-center gap-2"><span className="material-symbols-outlined text-purple-400 text-3xl">volume_up</span> Audio Phonics</span>
            </div>
          </div>


          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full mb-8">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-10 py-4 bg-primary-container hover:brightness-110 text-white rounded-full font-bold text-base transition-all shadow-[0_0_35px_rgba(80,143,248,0.3)] flex items-center justify-center gap-2"
            >
              Start Learning for FREE &rarr;
            </Link>
            <Link
              href="/dashboard/search"
              className="w-full sm:w-auto px-10 py-4 bg-transparent border border-white/20 hover:bg-white/5 text-[#dfe2ee] rounded-full font-bold text-base transition-all text-center"
            >
              Explore Dictionary
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
