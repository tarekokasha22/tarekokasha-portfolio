"use client";

const row1 = [
  "Next.js 15",
  "TypeScript",
  "Python",
  "LangChain",
  "Claude API",
  "OpenAI GPT-4o",
  "n8n",
  "PostgreSQL",
  "Supabase",
  "FastAPI",
  "Docker",
  "Vercel",
  "AWS",
  "Tailwind CSS",
  "GSAP",
];

const row2 = [
  "RAG Pipelines",
  "Vector Search",
  "Fine-tuning",
  "CrewAI",
  "LlamaIndex",
  "Zapier",
  "GoHighLevel",
  "Framer Motion",
  "Redis",
  "Pinecone",
  "GitHub Actions",
  "Cloudflare",
  "Three.js",
  "Prisma ORM",
  "Stripe",
];

function MarqueeRow({
  items,
  reverse = false,
  speed = "28s",
}: {
  items: string[];
  reverse?: boolean;
  speed?: string;
}) {
  // Double the array so the loop is seamless
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden py-2">
      {/* Fade edges */}
      <div
        className="absolute inset-y-0 left-0 w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, var(--color-ink), transparent)" }}
      />
      <div
        className="absolute inset-y-0 right-0 w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, var(--color-ink), transparent)" }}
      />

      <div
        className="marquee-track"
        style={{
          animationDuration: speed,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center">
            <span
              className="whitespace-nowrap text-xs"
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color:
                  i % 5 === 2
                    ? "var(--color-accent)"
                    : "var(--color-muted)",
              }}
            >
              {item}
            </span>
            <span className="marquee-sep" aria-hidden="true">
              ·
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function TechMarquee() {
  return (
    <section
      className="border-t border-rule py-6 overflow-hidden"
      aria-label="Technology stack"
    >
      <MarqueeRow items={row1} speed="32s" />
      <MarqueeRow items={row2} reverse speed="26s" />
    </section>
  );
}
