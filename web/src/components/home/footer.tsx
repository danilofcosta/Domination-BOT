export function Footer() {
  return (
    <footer className="max-w-6xl mx-auto mt-40 pb-20 border-t border-zinc-900 text-center space-y-6">
      <div className="pt-12 flex justify-center gap-10 text-zinc-600 text-[10px] uppercase tracking-[0.3em] font-black">
        <span className="hover:text-blue-500 transition-colors cursor-pointer">
          Github
        </span>
        <span className="hover:text-pink-500 transition-colors cursor-pointer">
          Discord
        </span>
        {/* <span className="hover:text-purple-500 transition-colors cursor-pointer">Comandos</span> */}
      </div>
      <p className="text-zinc-800 text-[10px] font-medium tracking-widest uppercase">
        &copy; {new Date().getFullYear()} Domination. Engine de Entretenimento
        de Elite.
      </p>
    </footer>
  );
}
