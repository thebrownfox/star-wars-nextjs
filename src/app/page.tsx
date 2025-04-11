import { Suspense } from "react";
import { fetchCharacters } from "@/lib/api";
import { CharacterList } from "@/components/character-list";
import { SearchControls } from "@/components/search-controls";

// This is now a Server Component that performs the initial data fetch
export default async function StarWarsPage({
	searchParams,
}: {
	searchParams: { search?: string; page?: string };
}) {
	const search = searchParams.search || "";
	const page = Number.parseInt(searchParams.page || "1", 10);

	// Server-side initial data fetch
	const initialData = await fetchCharacters(search, page);

	return (
		<main className="flex flex-col items-center p-6 bg-black text-yellow-400 min-h-screen h-full">
			{/* Skip to content link for keyboard users */}
			<a
				href="#characters"
				className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:p-2 focus:bg-yellow-600 focus:text-black focus:z-50 focus:rounded"
			>
				Skip to characters
			</a>

			<header className="mb-6">
				<h1 className="text-4xl font-bold mb-4 text-center">
					Star Wars Characters
				</h1>
				<SearchControls initialSearch={search} />
			</header>

			<Suspense fallback={<div>Loading...</div>}>
				<CharacterList
					initialCharacters={initialData.results}
					initialTotalCount={initialData.count}
					initialPage={page}
					initialSearch={search}
				/>
			</Suspense>
		</main>
	);
}
