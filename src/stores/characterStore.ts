import { atom, computed } from "nanostores"
import { fetchCharacters, type Character } from "@/lib/api"

export type { Character }

// NOTE: Extract character ID from the URL
export const getCharacterId = (url: string): number => {
    const matches = url.match(/\/people\/(\d+)\//)
    return matches ? Number.parseInt(matches[1], 10) : 0
}

export const getCharacterPicture = (character: Character) => {
    const characterId = getCharacterId(character.url)
    return `https://vieraboschkova.github.io/swapi-gallery/static/assets/img/people/${characterId}.jpg`
}

export const $loading = atom(false)
export const $totalCharacters = atom(0)
export const $page = atom(1)
export const $search = atom("")
export const $characters = atom<Character[]>([])

// NOTE: Sync function to update store with data from component when used via SSR
export const updateCharactersStore = (
    characters: Character[],
    totalCount: number
) => {
    $characters.set(characters)
    $totalCharacters.set(totalCount)
}

// NOTE: Client-side function to fetch data and update store
export const loadCharacters = async (search: string, page: number) => {
    try {
        $loading.set(true)
        const data = await fetchCharacters(search, page)
        updateCharactersStore(data.results, data.count)
    } catch (error) {
        console.error("Error loading characters:", error)
        updateCharactersStore([], 0)
    } finally {
        $loading.set(false)
    }
}

export const $totalPages = computed($totalCharacters, (total) =>
    Math.ceil(total / 10)
)
