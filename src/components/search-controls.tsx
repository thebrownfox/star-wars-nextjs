"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/useDebounce";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export const SearchControls = ({ initialSearch = "" }) => {
	const router = useRouter();
	const pathname = usePathname();
	const [searchInput, setSearchInput] = useState(initialSearch);
	const [isPending, startTransition] = useTransition();
	const debouncedSearch = useDebounce(searchInput, 300);

	// NOTE: Update URL when search changes
	useEffect(() => {
		startTransition(() => {
			const params = new URLSearchParams();
			if (debouncedSearch) {
				params.set("search", debouncedSearch);
			}
			// NOTE: Reset to page 1 on search
			params.set("page", "1");

			const query = params.toString();
			router.push(`${pathname}${query ? `?${query}` : ""}`);
		});
	}, [debouncedSearch, pathname, router]);

	return (
		<div role="search" className="flex justify-center items-center">
			{isPending && (
				<VisuallyHidden aria-live="polite">
					Updating search results...
				</VisuallyHidden>
			)}
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
	);
};
