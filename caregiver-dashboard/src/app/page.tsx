export default function Home() {
  return (
    <main className="min-h-screen p-24 bg-bg">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-heading text-primary font-bold mb-4">
          Elder Companion AI
        </h1>
        <p className="text-lg font-body text-textSecondary mb-8">
          Caregiver Dashboard - Setup Complete! 🎉
        </p>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-heading font-semibold mb-4">
              Custom Colors Test
            </h2>
            <div className="flex gap-4 flex-wrap">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary rounded-lg mb-2" />
                <p className="text-xs text-textSecondary">Primary</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-accent rounded-lg mb-2" />
                <p className="text-xs text-textSecondary">Accent</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-success rounded-lg mb-2" />
                <p className="text-xs text-textSecondary">Success</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-warn rounded-lg mb-2" />
                <p className="text-xs text-textSecondary">Warning</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-error rounded-lg mb-2" />
                <p className="text-xs text-textSecondary">Error</p>
              </div>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-heading font-semibold mb-2">
              Typography Test
            </h2>
            <p className="text-textPrimary mb-2">
              This is body text using Nunito Sans (18px)
            </p>
            <p className="text-textSecondary text-sm">
              This is secondary text (14px muted)
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-heading font-semibold">
              ✅ Setup Completed:
            </h3>
            <ul className="list-disc list-inside text-textSecondary space-y-1">
              <li>Next.js 15 with App Router</li>
              <li>TypeScript configured</li>
              <li>Tailwind CSS with custom colors</li>
              <li>Custom fonts (Playfair Display + Nunito Sans)</li>
              <li>Project structure created</li>
            </ul>
          </div>

          <div className="bg-surface p-6 rounded-lg shadow-md border-l-4 border-primary">
            <h3 className="text-lg font-heading font-semibold mb-2">
              📋 Next Steps:
            </h3>
            <ol className="list-decimal list-inside text-textSecondary space-y-1">
              <li>Install dependencies with: <code className="bg-gray-100 px-2 py-1 rounded">pnpm install</code></li>
              <li>Add shadcn/ui components</li>
              <li>Set up React Query provider</li>
              <li>Create API client</li>
              <li>Build authentication pages</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
