export default function Header() {
  return (
    <header className="w-full border-b border-border bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <a href="/" className="font-semibold tracking-tight">Cost-of-Living Saver</a>
        <nav className="text-sm text-muted-foreground flex gap-4">
          <a href="/upload" className="hover:text-foreground">Upload</a>
          <a href="/compare" className="hover:text-foreground">Compare</a>
        </nav>
      </div>
    </header>
  )
}

