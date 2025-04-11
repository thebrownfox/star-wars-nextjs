"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
	type Character,
	getCharacterPicture,
	updateCharactersStore,
	loadCharacters,
	$characters,
	$page,
	$search,
	$loading,
	$totalPages,
} from "@/stores/characterStore";
import { useStore } from "@nanostores/react";

type CharacterListProps = {
	initialCharacters: Character[];
	initialTotalCount: number;
	initialPage: number;
	initialSearch: string;
};

export const CharacterList = ({
	initialCharacters,
	initialTotalCount,
	initialPage,
	initialSearch,
}: CharacterListProps) => {
	const router = useRouter();
	const pathname = usePathname();

	// NOTE: Add a state to track initial loading
	const [isInitialized, setIsInitialized] = useState(false);

	// NOTE: Initialize the store with SSR data
	useEffect(() => {
		updateCharactersStore(initialCharacters, initialTotalCount);
		$page.set(initialPage);
		$search.set(initialSearch);
		setIsInitialized(true);
	}, [initialCharacters, initialTotalCount, initialPage, initialSearch]);

	const characters = useStore($characters);
	const loading = useStore($loading);
	const totalPages = useStore($totalPages);
	const search = useStore($search);
	const page = useStore($page);

	const [announcement, setAnnouncement] = useState("");

	// NOTE: Announce loading state changes
	useEffect(() => {
		if (loading) {
			setAnnouncement("Loading characters. Please wait.");
		} else if (!loading && characters.length > 0) {
			setAnnouncement(`Loaded ${characters.length} characters.`);
		} else if (!loading && characters.length === 0 && search.trim()) {
			setAnnouncement("No characters match your search.");
		}
	}, [loading, characters.length, search]);

	// NOTE: Update URL when page changes
	const updatePage = (newPage: number) => {
		const params = new URLSearchParams();
		if (search) params.set("search", search);
		params.set("page", newPage.toString());
		router.push(`${pathname}?${params.toString()}`);

		// NOTE: Update the store and refetch
		$page.set(newPage);
		loadCharacters(search, newPage);
	};

	const isLoading = loading || !isInitialized;

	return (
		<>
			<VisuallyHidden aria-live="polite" aria-atomic="true">
				{announcement}
			</VisuallyHidden>

			<Card
				id="characters"
				className="w-full max-w-6xl bg-gray-900 text-white min-h-0 overflow-hidden"
				tabIndex={-1}
			>
				<CardContent className="p-4 h-full">
					{isLoading ? (
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
					) : characters.length === 0 ? (
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
												<Image
													// width={0}
													// height={0}
													style={{
														objectFit: "cover",
													}}
													sizes="25vw"
													fill
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
					disabled={page === 1 || isLoading}
					onClick={() => updatePage(page - 1)}
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
					disabled={page === totalPages || isLoading}
					onClick={() => updatePage(page + 1)}
					variant="outline"
					className="border-yellow-400 text-yellow-400 bg-gray-700 hover:bg-yellow-400 hover:text-gray-900 border-2 focus-visible:ring-yellow-400"
					aria-label="Go to next page"
				>
					Next
				</Button>
			</nav>
		</>
	);
};
