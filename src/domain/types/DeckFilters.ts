import { DeckType, GameStage, TierRating } from '../entities/Deck';

export interface DeckFilters {
    deckType?: DeckType;
    gameStage?: GameStage;
    tierRating?: TierRating;
    isComplete?: boolean;
    hasCardSleeves?: boolean;
    storageLocation?: string;
}