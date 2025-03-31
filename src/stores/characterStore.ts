import { ofetch } from "ofetch"
import { atom, computed, task } from "nanostores"

const API_URL = "https://swapi.py4e.com/api/people/"

type Character = {
    name: string
    birth_year: string
    eye_color: string
    gender: string
    hair_color: string
    height: string
    mass: string
    skin_color: string
    homeworld: string
    films: string[]
    species: string[]
    starships: string[]
    vehicles: string[]
    url: string
    created: string
    edited: string
}

// Extract character ID from the URL
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

// NOTE: Search is not really needed here (we've got all the data already), but it's a good example of how to use it
export const fetchCharacters = async (
    search: string,
    page: number
): Promise<Character[]> => {
    try {
        $loading.set(true)
        const response = await ofetch(`${API_URL}`, {
            query: {
                search,
                page,
            },
        })
        $totalCharacters.set(response.count)

        return Array.isArray(response?.results) ? response.results : []
    } catch (error) {
        console.error("Error fetching characters:", error)
        return []
    } finally {
        $loading.set(false)
    }
}

export const $characters = computed([$search, $page], (search, page) =>
    task<Character[]>(async () => {
        // NOTE: task returns state as well, but we don't need it as we're not using it
        const characters = await fetchCharacters(search, page)
        return characters || []
    })
)

export const $totalPages = computed($totalCharacters, (total) =>
    Math.ceil(total / 10)
)
export const $selectedCharacter = atom<Character | null>(null)
export const selectCharacter = (character: Character) => {
    $selectedCharacter.set(character)
}
