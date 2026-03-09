import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Modal } from "#/components/Modal"
import BridgeDiscovery from "#/components/sections/BridgeDiscovery"

export const Route = createFileRoute("/")({ component: App })

const FEATURES = [
	{
		title: "Bridges",
		desc: "Discover Hue bridges and register your lightshow",
		detail: ({ onClose }: { onClose: () => void }) => <BridgeDiscovery onClose={onClose} />
			
	},
	{
		title: "Entertainment Areas",
		desc: "Call server code from your UI without creating API boilerplate.",
		detail: () =>
			"createServerFn lets you colocate server logic right next to the component that needs it. No manual fetch wrappers or API routes required — the framework handles serialization and RPC.",
	},
	{
		title: "Streaming by Default",
		desc: "Ship progressively rendered responses for faster experiences.",
		detail: () =>
			"TanStack Start streams HTML from the server as data resolves, so users see meaningful content immediately instead of waiting for every promise to settle before the page renders.",
	},
	{
		title: "Tailwind Native",
		desc: "Design quickly with utility-first styling and reusable tokens.",
		detail: () =>
			"Tailwind v4 is configured entirely in CSS — no config file needed. CSS custom properties define your design tokens (colors, spacing, typography) and can be overridden per-theme.",
	},
] as const

function App() {
	const [active, setActive] = useState<(typeof FEATURES)[number] | null>(null)

	return (
		<main className="page-wrap px-4 pb-8 pt-14">
			<section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
				<div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(204,58,8,0.32),transparent_66%)]" />
				<div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(110,28,8,0.18),transparent_66%)]" />
				<p className="island-kicker mb-3">TanStack Start Base Template</p>
				<h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
					Start simple, ship quickly.
				</h1>
				<p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
					This base starter intentionally keeps things light: two routes, clean
					structure, and the essentials you need to build from scratch.
				</p>
				<div className="flex flex-wrap gap-3">
					<a
						href="/about"
						className="rounded-full border border-[rgba(168,44,4,0.3)] bg-[rgba(204,58,8,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(204,58,8,0.24)]"
					>
						About This Starter
					</a>
				</div>
			</section>

			<section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{FEATURES.map((feature, index) => (
					<button
						type="button"
						key={feature.title}
						onClick={() => setActive(feature)}
						className="island-shell feature-card rise-in rounded-2xl p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
						style={{ animationDelay: `${index * 90 + 80}ms` }}
					>
						<h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
							{feature.title}
						</h2>
						<p className="m-0 text-sm text-[var(--sea-ink-soft)]">
							{feature.desc}
						</p>
					</button>
				))}
			</section>

			<Modal
				open={active !== null}
				onOpenChange={(open) => !open && setActive(null)}
				title={active?.title ?? ""}
				description={active?.desc}
			>
				{active?.detail({ onClose: () =>  setActive(null)})}
			</Modal>
		</main>
	)
}
