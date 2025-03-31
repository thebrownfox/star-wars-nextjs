"use client";

import { useState, useEffect, useRef } from "react";
import { useStore } from "@nanostores/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import {
	$characters,
	$page,
	$search,
	$totalCharacters,
	$loading,
	getCharacterPicture,
} from "@/stores/characterStore";
import { useDebounce } from "@/lib/useDebounce";

// Simple gray placeholder as data URL - much faster than external requests
const PLACEHOLDER_IMAGE =
	"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' text-anchor='middle' dominant-baseline='middle' fill='%23999999'%3ENo Image%3C/text%3E%3C/svg%3E";
// Component to handle image with fallback
const CoverImage = ({ src, alt }: { src?: string; alt: string }) => {
	const [imgSrc, setImgSrc] = useState(src || PLACEHOLDER_IMAGE);
	const imgRef = useRef<HTMLImageElement>(null);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		// Reset image source when prop changes
		setImgSrc(src || PLACEHOLDER_IMAGE);

		// Set a timeout to check if image loads within reasonable time
		if (src) {
			timeoutRef.current = setTimeout(() => {
				// If image is still not complete after timeout, use placeholder
				if (imgRef.current && !imgRef.current.complete) {
					setImgSrc(PLACEHOLDER_IMAGE);
				}
			}, 5000); // 5 second timeout
		}

		return () => {
			// Clear timeout on unmount or when src changes
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [src]);

	const handleError = () => {
		setImgSrc(PLACEHOLDER_IMAGE);
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
	};

	const handleLoad = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
	};

	return (
		<img
			ref={imgRef}
			src={imgSrc}
			alt={alt}
			style={{
				objectFit: "cover",
				width: "100%",
				height: "100%",
				borderRadius: "var(--radius-2)",
			}}
			onError={handleError}
			onLoad={handleLoad}
		/>
	);
};

const StarWarsCharacters = () => {
	const characters = useStore($characters);
	const loading = useStore($loading);
	const totalCharacters = useStore($totalCharacters);
	const search = useStore($search);
	const page = useStore($page);

	// Use a local state for the search input
	const [searchInput, setSearchInput] = useState(search);
	// Use the debounce hook at the component level
	const debouncedSearch = useDebounce(searchInput, 300);

	// Update the global search state when the debounced value changes
	// This effect should only run when debouncedSearch changes, not when page changes
	useEffect(() => {
		$search.set(debouncedSearch);
		// Reset to page 1 whenever search changes
		$page.set(1);
	}, [debouncedSearch]); // Removed page from dependencies

	// For screen reader announcements
	const [announcement, setAnnouncement] = useState("");

	// Announce loading state changes
	useEffect(() => {
		if (loading) {
			setAnnouncement("Loading characters. Please wait.");
		} else if (!loading && (characters?.length ?? 0) > 0) {
			setAnnouncement(`Loaded ${characters?.length ?? 0} characters.`);
		} else if (!loading && (characters?.length ?? 0) === 0 && search.trim()) {
			setAnnouncement("No characters match your search.");
		}
	}, [loading, characters?.length, search]);

	// Calculate total pages
	const totalPages = Math.ceil(totalCharacters / 10);

	return (
		<main className="flex flex-col items-center p-6 bg-black text-yellow-400 min-h-screen h-full">
			{/* Skip to content link for keyboard users */}
			<a
				href="#characters"
				className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:p-2 focus:bg-yellow-600 focus:text-black focus:z-50 focus:rounded"
			>
				Skip to characters
			</a>

			<VisuallyHidden aria-live="polite" aria-atomic="true">
				{announcement}
			</VisuallyHidden>

			<header className="mb-6">
				<h1 className="text-4xl font-bold mb-4 text-center">
					Star Wars Characters
				</h1>
				<div role="search" className="flex justify-center items-center">
					<label htmlFor="search-characters" className="sr-only">
						Search characters
					</label>
					<Input
						id="search-characters"
						type="search"
						placeholder="Search characters..."
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						className="w-50 bg-gray-800 text-white focus-visible:ring-yellow-400"
						aria-label="Search characters"
					/>
				</div>
			</header>

			<Card className="w-full max-w-6xl bg-gray-900 text-white min-h-0 overflow-hidden">
				<CardContent id="characters" className="p-4 h-full" tabIndex={-1}>
					{loading ? (
						<div
							className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
							aria-busy="true"
							aria-label="Loading characters"
						>
							{[...Array(10)].map((_, index) => (
								<Card key={index} className="bg-gray-800">
									<div className="aspect-[4/3] relative">
										<Skeleton className="absolute inset-0" />
									</div>
									<CardContent className="p-3">
										<Skeleton className="h-4 w-3/4 mb-2" />
										<Skeleton className="h-3 w-1/2 mb-1" />
										<Skeleton className="h-3 w-2/3" />
									</CardContent>
								</Card>
							))}
						</div>
					) : characters?.length === 0 ? (
						<div
							className="text-center py-10 text-gray-400"
							role="status"
							aria-live="polite"
						>
							{search.trim()
								? "No characters match your search."
								: "There's no response from API."}
						</div>
					) : (
						<ScrollArea className="h-full">
							<div
								className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4"
								role="list"
								aria-label="Star Wars characters"
							>
								{characters?.map((character, index) => (
									<div
										role="listitem"
										key={character.name}
										tabIndex={0}
										className="outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded-lg"
									>
										<Card className="bg-gray-800 flex flex-col h-full overflow-hidden">
											<AspectRatio ratio={4 / 3} className="bg-gray-700">
												<CoverImage
													src={getCharacterPicture(character)}
													alt={`Character ${character.name}: ${character.gender}, with ${character.eye_color} eyes and ${character.hair_color} hair`}
												/>
											</AspectRatio>
											<CardContent className="p-3 flex flex-col flex-grow">
												<h3 className="text-lg font-bold mb-1 text-yellow-400">
													{character.name}
												</h3>

												<dl className="text-sm space-y-1 text-gray-300 mb-2">
													<div className="flex justify-between">
														<dt>Height:</dt>
														<dd>{character.height} cm</dd>
													</div>
													<div className="flex justify-between">
														<dt>Mass:</dt>
														<dd>
															{character.mass}{" "}
															{character.mass === "unknown" ? "" : " kg"}
														</dd>
													</div>
													<div className="flex justify-between">
														<dt>Birth Year:</dt>
														<dd>{character.birth_year}</dd>
													</div>
												</dl>

												<div className="mt-auto pt-2 border-t border-gray-700">
													<div
														className="flex flex-wrap gap-1"
														aria-label="Character traits"
													>
														<Badge
															variant="outline"
															className="text-xs bg-gray-700 text-yellow-400"
														>
															{character.gender}
														</Badge>
														{character.eye_color && (
															<Badge
																variant="outline"
																className="text-xs bg-gray-700 text-yellow-400"
															>
																{character.eye_color} eyes
															</Badge>
														)}
														{character.hair_color && (
															<Badge
																variant="outline"
																className="text-xs bg-gray-700 text-yellow-400"
															>
																{character.hair_color} hair
															</Badge>
														)}
													</div>
												</div>
											</CardContent>
										</Card>
									</div>
								))}
							</div>
						</ScrollArea>
					)}
				</CardContent>
			</Card>
			<nav className="flex gap-4 mt-4" aria-label="Pagination">
				<Button
					disabled={page === 1 || loading}
					onClick={() => $page.set(page - 1)}
					variant="outline"
					className="border-yellow-400 text-yellow-400 bg-gray-700 hover:bg-yellow-400 hover:text-gray-900 border-2 focus-visible:ring-yellow-400"
					aria-label="Go to previous page"
				>
					Previous
				</Button>
				<div className="flex items-center" aria-current="page" role="status">
					Page {page} of {totalPages || 1}
				</div>
				<Button
					disabled={page === totalPages || loading}
					onClick={() => $page.set(page + 1)}
					variant="outline"
					className="border-yellow-400 text-yellow-400 bg-gray-700 hover:bg-yellow-400 hover:text-gray-900 border-2 focus-visible:ring-yellow-400"
					aria-label="Go to next page"
				>
					Next
				</Button>
			</nav>
		</main>
	);
};

export default StarWarsCharacters;
