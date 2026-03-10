import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Modal } from "#/components/Modal";
import BridgeDiscovery from "#/components/sections/BridgeDiscovery";
import EntertainmentAreas from "#/components/sections/EntertainmentAreas";
import VideoInputs from "#/components/sections/VideoInputs";
import { usePersistedState } from "#/hooks/usePersistedState";
import {
	getEntertainmentAreas,
	getVideoInputs,
	initializeBridge,
} from "#/lib/hue.functions";
import type { HueBridgeRegistration } from "#/lib/types";

enum ModalState {
	IDLE,
	BRIDGES,
	ENTERTAINMENT_AREAS,
	VIDEO_INPUTS,
}

export const Route = createFileRoute("/")({ component: App });

function App() {
	const [modalState, setModalState] = useState(ModalState.IDLE);
	const [isPlaying, setIsPlaying] = useState(false);
	const [selectedAreaId] = usePersistedState<string | null>(
		"entertainment-area",
		null,
	);
	const [selectedVideoInputId] = usePersistedState<string | null>(
		"video-input",
		null,
	);
	const [bridgeReg] = usePersistedState<HueBridgeRegistration | null>(
		"bridge-reg",
		null,
	);

	const { data: areas } = useQuery({
		queryKey: ["entertainment-areas"],
		queryFn: getEntertainmentAreas,
		enabled: !!bridgeReg,
	});

	const { data: videoInputs } = useQuery({
		queryKey: ["video-inputs"],
		queryFn: getVideoInputs,
	});

	useEffect(() => {
		if (bridgeReg) {
			initializeBridge({ data: bridgeReg });
		}
	}, [bridgeReg]);

	const selectedArea = areas?.find(
		(a: { id: string; name: string }) => a.id === selectedAreaId,
	);

	const selectedVideoInput = videoInputs?.find(
		(v: { id: string; name: string }) => v.id === selectedVideoInputId,
	);

	return (
		<main className="page-wrap px-4 pb-8 pt-14">
			<section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
				<div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(204,58,8,0.32),transparent_66%)]" />
				<div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(110,28,8,0.18),transparent_66%)]" />
				<button
					type="button"
					onClick={() => setIsPlaying((p) => !p)}
					aria-label={isPlaying ? "Pause sync" : "Play sync"}
					className="absolute bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--lagoon-deep)] text-white shadow-lg transition hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
				>
					{isPlaying ? (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="22"
							height="22"
							viewBox="0 0 24 24"
							fill="currentColor"
							aria-hidden="true"
						>
							<rect x="6" y="5" width="4" height="14" rx="1" />
							<rect x="14" y="5" width="4" height="14" rx="1" />
						</svg>
					) : (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="22"
							height="22"
							viewBox="0 0 24 24"
							fill="currentColor"
							aria-hidden="true"
						>
							<path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z" />
						</svg>
					)}
				</button>
				<p className="island-kicker mb-3">Hue HDMI Sync</p>
				<h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
					Sync your lights to your TV.
				</h1>
				<div className="mb-8 flex flex-wrap gap-6">
					<div>
						<p className="text-xs font-semibold uppercase tracking-widest text-[var(--sea-ink-soft)] mb-1">
							Bridge
						</p>
						{bridgeReg ? (
							<p className="text-base font-medium text-[var(--sea-ink)]">
								{bridgeReg.ip}
							</p>
						) : (
							<p className="text-base text-[var(--sea-ink-soft)] italic">
								Not paired
							</p>
						)}
					</div>
					<div>
						<p className="text-xs font-semibold uppercase tracking-widest text-[var(--sea-ink-soft)] mb-1">
							Entertainment Area
						</p>
						{selectedArea ? (
							<p className="text-base font-medium text-[var(--sea-ink)]">
								{selectedArea.name}
							</p>
						) : (
							<p className="text-base text-[var(--sea-ink-soft)] italic">
								None selected
							</p>
						)}
					</div>
					<div>
						<p className="text-xs font-semibold uppercase tracking-widest text-[var(--sea-ink-soft)] mb-1">
							Video Input
						</p>
						{selectedVideoInput ? (
							<p className="text-base font-medium text-[var(--sea-ink)]">
								{selectedVideoInput.name}
							</p>
						) : (
							<p className="text-base text-[var(--sea-ink-soft)] italic">
								None selected
							</p>
						)}
					</div>
				</div>
			</section>

			<section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<button
					type="button"
					onClick={() => setModalState(ModalState.BRIDGES)}
					className="island-shell feature-card rise-in rounded-2xl p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
					style={{ animationDelay: `${0 * 90 + 80}ms` }}
				>
					<h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
						Bridges
					</h2>
					<p className="m-0 text-sm text-[var(--sea-ink-soft)]">
						Discover Hue bridges and register your lightshow
					</p>
					{bridgeReg && (
						<p className="mt-3 text-xs font-medium text-[var(--lagoon-deep)] truncate">
							{bridgeReg.name} ({bridgeReg.ip})
						</p>
					)}
				</button>
				<button
					type="button"
					onClick={() => setModalState(ModalState.ENTERTAINMENT_AREAS)}
					className="island-shell feature-card rise-in rounded-2xl p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
					style={{ animationDelay: `${1 * 90 + 80}ms` }}
				>
					<h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
						Entertainment Areas
					</h2>
					<p className="m-0 text-sm text-[var(--sea-ink-soft)]">
						select a target to send color updates
					</p>
					{selectedArea && (
						<p className="mt-3 text-xs font-medium text-[var(--lagoon-deep)] truncate">
							{selectedArea.name}
						</p>
					)}
				</button>
				<button
					type="button"
					onClick={() => setModalState(ModalState.VIDEO_INPUTS)}
					className="island-shell feature-card rise-in rounded-2xl p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer flex flex-start flex-col"
					style={{ animationDelay: `${2 * 90 + 80}ms` }}
				>
					<h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
						Video Input
					</h2>
					<p className="m-0 text-sm text-[var(--sea-ink-soft)]">
						select an input to capture its content
					</p>
					{selectedVideoInput && (
						<p className="mt-3 text-xs font-medium text-[var(--lagoon-deep)] truncate">
							{selectedVideoInput.name}
						</p>
					)}
				</button>
			</section>
			<Modal
				open={modalState === ModalState.BRIDGES}
				onOpenChange={(open) => !open && setModalState(ModalState.IDLE)}
				title="Bridges"
			>
				<BridgeDiscovery onClose={() => setModalState(ModalState.IDLE)} />
			</Modal>
			<Modal
				open={modalState === ModalState.ENTERTAINMENT_AREAS}
				onOpenChange={(open) => !open && setModalState(ModalState.IDLE)}
				title="Entertainmen Areas"
			>
				<EntertainmentAreas />
			</Modal>
			<Modal
				open={modalState === ModalState.VIDEO_INPUTS}
				onOpenChange={(open) => !open && setModalState(ModalState.IDLE)}
				title="Video Inputs"
			>
				<VideoInputs />
			</Modal>
		</main>
	);
}
