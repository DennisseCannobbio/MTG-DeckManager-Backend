import { Request, Response } from 'express';
import { 
    DeckUseCases, 
    CreateDeckRequest, 
    UpdateDeckRequest 
} from '@application/use-cases/DeckUseCases'
import { DeckFilters, PaginationOptions } from '@domain/repositories/DeckRepository';

export class DeckController {
    constructor(private readonly deckUseCases: DeckUseCases) {}

    createDeck = async (req: Request, res: Response): Promise<void> => {
        try {
            const createRequest: CreateDeckRequest = req.body;
            
            if (!createRequest.name || !createRequest.description) {
                res.status(400).json({
                    success: false,
                    message: 'Name and description are required',
                    error: 'VALIDATION_ERROR'
                });
                return;
            }

            const deck = await this.deckUseCases.createDeck(createRequest);
            
            res.status(201).json({
                success: true,
                message: 'Deck created successfully',
                data: deck
            });
        } catch (error: any) {
            console.error('Error creating deck:', error);
            
            if (error.message.includes('already exists')) {
                res.status(409).json({
                    success: false,
                    message: error.message,
                    error: 'CONFLICT'
                });
        } else {
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR'
            });
        }
        }
    };

    // 📖 READ - Obtener mazo por ID
    getDeckById = async (req: Request, res: Response): Promise<void> => {
        try {
        const { id } = req.params;
        
        if (!id) {
            res.status(400).json({
            success: false,
            message: 'Deck ID is required',
            error: 'VALIDATION_ERROR'
            });
            return;
        }

        const deck = await this.deckUseCases.getDeckById(id);
        
        if (!deck) {
            res.status(404).json({
            success: false,
            message: `Deck with id '${id}' not found`,
            error: 'NOT_FOUND'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: deck
        });
        } catch (error: any) {
        console.error('Error getting deck:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'INTERNAL_ERROR'
        });
        }
    };

    // 📋 READ ALL - Obtener todos los mazos con filtros y paginación
    getAllDecks = async (req: Request, res: Response): Promise<void> => {
        try {
        // Extraer filtros de query parameters
        const filters: DeckFilters = {
            deckType: req.query.deckType as any,
            gameStage: req.query.gameStage as any,
            tierRating: req.query.tierRating as any,
            isComplete: req.query.isComplete ? req.query.isComplete === 'true' : undefined,
            hasCardSleeves: req.query.hasCardSleeves ? req.query.hasCardSleeves === 'true' : undefined,
            storageLocation: req.query.storageLocation as string
        };

        // Extraer opciones de paginación
        const pagination: PaginationOptions = {
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 10,
            sortBy: req.query.sortBy as any || 'createdAt',
            sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
        };

        // Validar paginación
        if (pagination.page < 1) pagination.page = 1;
        if (pagination.limit < 1 || pagination.limit > 100) pagination.limit = 10;

        const result = await this.deckUseCases.getAllDecks(filters, pagination);

        res.status(200).json({
            success: true,
            data: result.data,
            pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
            }
        });
        } catch (error: any) {
        console.error('Error getting decks:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'INTERNAL_ERROR'
        });
        }
    };

    // ✏️ UPDATE - Actualizar mazo
    updateDeck = async (req: Request, res: Response): Promise<void> => {
        try {
        const { id } = req.params;
        const updateRequest: UpdateDeckRequest = req.body;

        if (!id) {
            res.status(400).json({
            success: false,
            message: 'Deck ID is required',
            error: 'VALIDATION_ERROR'
            });
            return;
        }

        const updatedDeck = await this.deckUseCases.updateDeck(id, updateRequest);

        if (!updatedDeck) {
            res.status(404).json({
            success: false,
            message: `Deck with id '${id}' not found`,
            error: 'NOT_FOUND'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Deck updated successfully',
            data: updatedDeck
        });
        } catch (error: any) {
        console.error('Error updating deck:', error);
        
        if (error.message.includes('not found')) {
            res.status(404).json({
            success: false,
            message: error.message,
            error: 'NOT_FOUND'
            });
        } else if (error.message.includes('already exists')) {
            res.status(409).json({
            success: false,
            message: error.message,
            error: 'CONFLICT'
            });
        } else {
            res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'INTERNAL_ERROR'
            });
        }
        }
    };

    // 🗑️ DELETE - Eliminar mazo
    deleteDeck = async (req: Request, res: Response): Promise<void> => {
        try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
            success: false,
            message: 'Deck ID is required',
            error: 'VALIDATION_ERROR'
            });
            return;
        }

        const deleted = await this.deckUseCases.deleteDeck(id);

        if (!deleted) {
            res.status(404).json({
            success: false,
            message: `Deck with id '${id}' not found`,
            error: 'NOT_FOUND'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Deck deleted successfully'
        });
        } catch (error: any) {
        console.error('Error deleting deck:', error);
        
        if (error.message.includes('not found')) {
            res.status(404).json({
            success: false,
            message: error.message,
            error: 'NOT_FOUND'
            });
        } else {
            res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'INTERNAL_ERROR'
            });
        }
        }
    };

    // 🔍 SEARCH - Buscar mazos por palabra clave
    searchDecks = async (req: Request, res: Response): Promise<void> => {
        try {
        const { keyword } = req.query;

        if (!keyword || typeof keyword !== 'string') {
            res.status(400).json({
            success: false,
            message: 'Search keyword is required',
            error: 'VALIDATION_ERROR'
            });
            return;
        }

        const decks = await this.deckUseCases.searchDecks(keyword);

        res.status(200).json({
            success: true,
            data: decks,
            count: decks.length
        });
        } catch (error: any) {
        console.error('Error searching decks:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'INTERNAL_ERROR'
        });
        }
    };

    // 📦 SPECIAL - Obtener mazos incompletos
    getIncompleteDecks = async (req: Request, res: Response): Promise<void> => {
        try {
        const decks = await this.deckUseCases.getIncompleteDecks();

        res.status(200).json({
            success: true,
            data: decks,
            count: decks.length
        });
        } catch (error: any) {
        console.error('Error getting incomplete decks:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'INTERNAL_ERROR'
        });
        }
    };

    getDecksByLocation = async (req: Request, res: Response): Promise<void> => {
        try {
        const { location } = req.params;

        if (!location) {
            res.status(400).json({
            success: false,
            message: 'Storage location is required',
            error: 'VALIDATION_ERROR'
            });
            return;
        }

        const decks = await this.deckUseCases.getDecksByStorageLocation(location);

        res.status(200).json({
            success: true,
            data: decks,
            count: decks.length
        });
        } catch (error: any) {
        console.error('Error getting decks by location:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'INTERNAL_ERROR'
        });
        }
    };
}