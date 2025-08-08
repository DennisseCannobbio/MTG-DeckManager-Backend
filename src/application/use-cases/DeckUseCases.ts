import { Deck, DeckEntity } from '@domain/entities/Deck';
import { DeckRepository, DeckFilters, PaginationOptions, PaginatedResult } from '@domain/repositories/DeckRepository';

// * DTOs (Data Transfer Objects) => Comunication with the exterior
export interface CreateDeckRequest {
    name: string;
    description: string;
    colors: string[];
    tierRating: string;
    hasCardSleeves: boolean;
    isComplete: boolean;
    deckType: string;
    gameStage: string;
    storageLocation: string;
    descriptiveImage?: string;
    planeswalker?: string;
}

export interface UpdateDeckRequest {
    name?: string;
    description?: string;
    colors?: string[];
    tierRating?: string;
    hasCardSleeves?: boolean;
    isComplete?: boolean;
    deckType?: string;
    gameStage?: string;
    storageLocation?: string;
    descriptiveImage?: string;
    planeswalker?: string;
}

export interface DeckResponse {
    id: string;
    name: string;
    description: string;
    colors: string[];
    tierRating: string;
    hasCardSleeves: boolean;
    isComplete: boolean;
    deckType: string;
    gameStage: string;
    storageLocation: string;
    descriptiveImage?: string;
    planeswalker?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class DeckUseCases {
    constructor(private readonly deckRepository: DeckRepository) {}

    async createDeck(request: CreateDeckRequest): Promise<DeckResponse> {
        const existingDeck = await this.deckRepository.findByName(request.name);
        if (existingDeck) {
            throw new Error(`Deck with name '${request.name}' already exists`);
        }

        const deckEntity = new DeckEntity(
            request.name,
            request.description,
            request.colors as any[], 
            request.tierRating as any,
            request.hasCardSleeves,
            request.isComplete,
            request.deckType as any,
            request.gameStage as any,
            request.storageLocation,
            request.descriptiveImage,
            request.planeswalker
        );

        const createdDeck = await this.deckRepository.create(deckEntity);
        return this.mapDeckToResponse(createdDeck);
    }

    async getDeckById(id: string): Promise<DeckResponse | null> {
        const deck = await this.deckRepository.findById(id);
        return deck ? this.mapDeckToResponse(deck) : null;
    }

    async getAllDecks(
        filters?: DeckFilters, 
        pagination?: PaginationOptions
    ): Promise<PaginatedResult<DeckResponse>> {
        const result = await this.deckRepository.findAll(filters, pagination);
        
        return {
        ...result,
        data: result.data.map(deck => this.mapDeckToResponse(deck))
        };
    }

    async updateDeck(id: string, request: UpdateDeckRequest): Promise<DeckResponse | null> {
        const existingDeck = await this.deckRepository.findById(id);
        if (!existingDeck) {
        throw new Error(`Deck with id '${id}' not found`);
        }

        if (request.name && request.name !== existingDeck.name) {
        const deckWithSameName = await this.deckRepository.findByName(request.name);
        if (deckWithSameName) {
            throw new Error(`Deck with name '${request.name}' already exists`);
        }
        }

        const updatedDeck = await this.deckRepository.update(id, request as any);
        return updatedDeck ? this.mapDeckToResponse(updatedDeck) : null;
    }

    async deleteDeck(id: string): Promise<boolean> {
        const existingDeck = await this.deckRepository.findById(id);
        if (!existingDeck) {
        throw new Error(`Deck with id '${id}' not found`);
        }

        return await this.deckRepository.delete(id);
    }

    async searchDecks(keyword: string): Promise<DeckResponse[]> {
        const decks = await this.deckRepository.searchByKeyword(keyword);
        return decks.map(deck => this.mapDeckToResponse(deck));
    }

    async getIncompleteDecks(): Promise<DeckResponse[]> {
        const decks = await this.deckRepository.findIncompleteDecks();
        return decks.map(deck => this.mapDeckToResponse(deck));
    }

    async getDecksByStorageLocation(location: string): Promise<DeckResponse[]> {
        const decks = await this.deckRepository.findByStorageLocation(location);
        return decks.map(deck => this.mapDeckToResponse(deck));
    }

    private mapDeckToResponse(deck: Deck): DeckResponse {
        return {
            id: deck.id,
            name: deck.name,
            description: deck.description,
            colors: deck.colors,
            tierRating: deck.tierRating,
            hasCardSleeves: deck.hasCardSleeves,
            isComplete: deck.isComplete,
            deckType: deck.deckType,
            gameStage: deck.gameStage,
            storageLocation: deck.storageLocation,
            descriptiveImage: deck.descriptiveImage,
            planeswalker: deck.planeswalker,
            createdAt: deck.createdAt,
            updatedAt: deck.updatedAt
        };
    }
}