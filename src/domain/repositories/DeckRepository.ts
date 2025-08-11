import { Deck, DeckType, GameStage, TierRating } from '../entities/Deck';
import { DeckFilters, PaginationOptions, PaginatedResult } from '../types';

export interface DeckRepository {
    // * CRUD
    create(deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deck>;
    findById(id: string): Promise<Deck | null>;
    findAll(filters?: DeckFilters, pagination?: PaginationOptions): Promise<PaginatedResult<Deck>>;
    update(id: string, updates: Partial<Omit<Deck, 'id' | 'createdAt'>>): Promise<Deck | null>;
    delete(id: string): Promise<boolean>;
    
    // * Domain Operations
    findByName(name: string): Promise<Deck | null>;
    findByTierRating(tierRating: TierRating): Promise<Deck[]>;
    findByDeckType(deckType: DeckType): Promise<Deck[]>;
    findByStorageLocation(location: string): Promise<Deck[]>;
    countByFilters(filters: DeckFilters): Promise<number>;
    
    // * Advance Search
    searchByKeyword(keyword: string): Promise<Deck[]>;
    findIncompleteDecks(): Promise<Deck[]>;
    findDecksByColors(colors: string[]): Promise<Deck[]>;
}