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