import { cache } from "react"
import { ofetch } from "ofetch"

const API_URL = "https://swapi.py4e.com/api/people/"

export type Character = {
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

export type ApiResponse = {
    count: number
    next: string | null
    previous: string | null
    results: Character[]
}

//NOTE: Cached fetch for SSR and client-side revalidation
export const fetchCharacters = cache(
    async (search: string, page: number): Promise<ApiResponse> => {
        try {
            // Use ofetch instead of fetch
            const response = await ofetch<ApiResponse>(`${API_URL}`, {
                query: {
                    search: search || "",
                    page: page.toString(),
                },
            })

            return (
                response || {
                    count: 0,
                    next: null,
                    previous: null,
                    results: [],
                }
            )
        } catch (error) {
            console.error("Error fetching characters:", error)
            return { count: 0, next: null, previous: null, results: [] }
        }
    }
)
