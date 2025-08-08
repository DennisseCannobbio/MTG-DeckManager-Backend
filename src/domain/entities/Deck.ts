export interface Deck {
    id: string;
    name: string;
    description: string;
    colors: MagicColor[];
    tierRating: TierRating;
    hasCardSleeves: boolean;
    isComplete: boolean;
    descriptiveImage?: string;
    deckType: DeckType;
    gameStage: GameStage;
    storageLocation: string;
    planeswalker?: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum MagicColor {
    WHITE = 'W',
    BLUE = 'U', 
    BLACK = 'B',
    RED = 'R',
    GREEN = 'G',
    COLORLESS = 'C'
}

export enum TierRating {
    S = 'S',
    A = 'A', 
    B = 'B',
    C = 'C',
    D = 'D'
}

export enum DeckType {
    AGGRO = 'AGGRO',
    COMBO = 'COMBO',
    CONTROL = 'CONTROL'
}

export enum GameStage {
    EARLY = 'EARLY',   
    MID = 'MID',       
    LATE = 'LATE'      
}

export class DeckEntity implements Deck {
    constructor(
        public name: string,
        public description: string,
        public colors: MagicColor[],
        public tierRating: TierRating,
        public hasCardSleeves: boolean,
        public isComplete: boolean,
        public deckType: DeckType,
        public gameStage: GameStage,
        public storageLocation: string,
        public descriptiveImage?: string,
        public planeswalker?: string,
        public id: string = '',
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date()
    ) {
        this.validateDeck();
    }

    private validateDeck(): void {
        if (!this.name || this.name.trim().length === 0) {
            throw new Error('Deck name is required');
        }
        
        if (!this.description || this.description.trim().length === 0) {
            throw new Error('Deck description is required');
        }
        
        if (!this.colors || this.colors.length === 0) {
            throw new Error('At least one color is required');
        }
        
        if (!this.storageLocation || this.storageLocation.trim().length === 0) {
            throw new Error('Storage location is required');
        }
    }

    public updateDeck(updates: Partial<Omit<Deck, 'id' | 'createdAt'>>): void {
        Object.assign(this, updates);
        this.updatedAt = new Date();
        this.validateDeck();
    }
}