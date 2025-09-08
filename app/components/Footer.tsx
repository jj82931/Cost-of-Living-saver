export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background text-muted-foreground">
      <div className="mx-auto max-w-5xl px-4 py-6 text-xs">
        <p>&copy; {new Date().getFullYear()} Cost-of-Living Saver. All rights reserved.</p>
      </div>
    </footer>
  )
}

