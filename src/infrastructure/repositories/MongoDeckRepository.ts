import { 
        Deck, 
        MagicColor, 
        TierRating, 
        DeckType, 
        GameStage 
    } from '@domain/entities/Deck';
import { 
        DeckRepository, 
        DeckFilters, 
        PaginationOptions, 
        PaginatedResult 
} from '@domain/repositories/DeckRepository';
import { DeckModel, DeckDocument } from '../database/schemas/DeckSchema';
import { SortOrder, Types } from 'mongoose';

export class MongoDeckRepository implements DeckRepository {

    async create(deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deck> {
        try {
            const { id, createdAt, updatedAt, ...cleanDeckData } = deck as any;
            
            const deckDocument = new DeckModel(cleanDeckData);
            const savedDeck = await deckDocument.save();
            return this.mapDocumentToEntity(savedDeck);
        } catch (error: any) {
            if (error.code === 11000) {
                throw new Error(`Deck with name '${deck.name}' already exists`);
            }
            throw new Error(`Failed to create deck: ${error.message}`);
        }
    }

    async findById(id: string): Promise<Deck | null> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                return null;
            }
            
            const deckDocument = await DeckModel.findById(id);
            return deckDocument ? this.mapDocumentToEntity(deckDocument) : null;
        } catch (error: any) {
            throw new Error(`Failed to find deck by id: ${error.message}`);
        }
    }

    async findAll(
        filters?: DeckFilters, 
        pagination?: PaginationOptions
    ): Promise<PaginatedResult<Deck>> {
        try {
            const query = this.buildFilterQuery(filters);
            
            // * Paginator
            const page = pagination?.page || 1;
            const limit = pagination?.limit || 10;
            const skip = (page - 1) * limit;
            
            // * Sorting
            const sortField = pagination?.sortBy || 'createdAt';
            const sortOrder = pagination?.sortOrder === 'asc' ? 1 : -1;
            // const sort = { [sortField]: sortOrder };
            const sort: { [key: string]: SortOrder } = { [sortField]: sortOrder };

    
            const [documents, total] = await Promise.all([
            DeckModel.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit) 
                .exec(),
            DeckModel.countDocuments(query)
            ]);
    
            const decks = documents.map(doc => this.mapDocumentToEntity(doc));
            const totalPages = Math.ceil(total / limit);
    
            return {
                data: decks,
                total,
                page,
                limit,
                totalPages
            };
        } catch (error: any) {
            throw new Error(`Failed to find decks: ${error.message}`);
        }
    }

    async update(
        id: string, 
        updates: Partial<Omit<Deck, 'id' | 'createdAt'>>
    ): Promise<Deck | null> {
        try {
            if (!Types.ObjectId.isValid(id)) {
            return null;
            }
    
            const updatedDocument = await DeckModel.findByIdAndUpdate(
            id,
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
            );
    
            return updatedDocument ? this.mapDocumentToEntity(updatedDocument) : null;
        } catch (error: any) {
            if (error.code === 11000) {
                throw new Error(`Deck with name '${updates.name}' already exists`);
            }
            throw new Error(`Failed to update deck: ${error.message}`);
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                return false;
            }
    
            const result = await DeckModel.findByIdAndDelete(id);
            return !!result;
        } catch (error: any) {
            throw new Error(`Failed to delete deck: ${error.message}`);
        }
    }

    // Domain-specific operations
    async findByName(name: string): Promise<Deck | null> {
        try {
            const deckDocument = await DeckModel.findOne({ 
            name: new RegExp(`^${name}$`, 'i') // Case-insensitive exact match
            });
            return deckDocument ? this.mapDocumentToEntity(deckDocument) : null;
        } catch (error: any) {
            throw new Error(`Failed to find deck by name: ${error.message}`);
        }
    }

    async findByTierRating(tierRating: TierRating): Promise<Deck[]> {
        try {
            const documents = await DeckModel.find({ tierRating });
            return documents.map(doc => this.mapDocumentToEntity(doc));
        } catch (error: any) {
            throw new Error(`Failed to find decks by tier rating: ${error.message}`);
        }
    }

    async findByDeckType(deckType: DeckType): Promise<Deck[]> {
        try {
            const documents = await DeckModel.find({ deckType });
            return documents.map(doc => this.mapDocumentToEntity(doc));
        } catch (error: any) {
            throw new Error(`Failed to find decks by type: ${error.message}`);
        }
    }

    async findByStorageLocation(location: string): Promise<Deck[]> {
        try {
            const documents = await DeckModel.find({ 
            storageLocation: new RegExp(location, 'i') 
            });
            return documents.map(doc => this.mapDocumentToEntity(doc));
        } catch (error: any) {
            throw new Error(`Failed to find decks by storage location: ${error.message}`);
        }
    }

    async countByFilters(filters: DeckFilters): Promise<number> {
        try {
            const query = this.buildFilterQuery(filters);
            return await DeckModel.countDocuments(query);
        } catch (error: any) {
            throw new Error(`Failed to count decks: ${error.message}`);
        }
    }

    async searchByKeyword(keyword: string): Promise<Deck[]> {
        try {
            const documents = await DeckModel.find({
                $text: { $search: keyword }
            }, {
                score: { $meta: 'textScore' }
            }).sort({
                score: { $meta: 'textScore' }
            });
    
            return documents.map(doc => this.mapDocumentToEntity(doc));
        } catch (error: any) {
            throw new Error(`Failed to search decks: ${error.message}`);
        }
    }

    async findIncompleteDecks(): Promise<Deck[]> {
        try {
            const documents = await DeckModel.find({ isComplete: false });
            return documents.map(doc => this.mapDocumentToEntity(doc));
        } catch (error: any) {
            throw new Error(`Failed to find incomplete decks: ${error.message}`);
        }
    }

    async findDecksByColors(colors: string[]): Promise<Deck[]> {
        try {
            const documents = await DeckModel.find({
            colors: { $in: colors }
            });
            return documents.map(doc => this.mapDocumentToEntity(doc));
        } catch (error: any) {
            throw new Error(`Failed to find decks by colors: ${error.message}`);
        }
    }

    // Helper methods
    private buildFilterQuery(filters?: DeckFilters): any {
        const query: any = {};
    
        if (filters) {
            if (filters.deckType) query.deckType = filters.deckType;
            if (filters.gameStage) query.gameStage = filters.gameStage;
            if (filters.tierRating) query.tierRating = filters.tierRating;
            if (filters.isComplete !== undefined) query.isComplete = filters.isComplete;
            if (filters.hasCardSleeves !== undefined) query.hasCardSleeves = filters.hasCardSleeves;
            if (filters.storageLocation) {
                query.storageLocation = new RegExp(filters.storageLocation, 'i');
            }
        }

        return query;
    }

    private mapDocumentToEntity(document: DeckDocument): Deck {
        return {
            id: document._id.toString(),
            name: document.name,
            description: document.description,
            colors: document.colors,
            tierRating: document.tierRating,
            hasCardSleeves: document.hasCardSleeves,
            isComplete: document.isComplete,
            descriptiveImage: document.descriptiveImage,
            deckType: document.deckType,
            gameStage: document.gameStage,
            storageLocation: document.storageLocation,
            planeswalker: document.planeswalker,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt
        };
    }
}