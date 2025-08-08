import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { MagicColor, TierRating, DeckType, GameStage } from '@domain/entities/Deck';

const createDeckSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Deck name is required',
            'string.min': 'Deck name must be at least 1 character',
            'string.max': 'Deck name cannot exceed 100 characters'
        }),
        
    description: Joi.string()
        .trim()
        .min(1)
        .max(500)
        .required()
        .messages({
            'string.empty': 'Description is required',
            'string.max': 'Description cannot exceed 500 characters'
        }),
        
    colors: Joi.array()
        .items(Joi.string().valid(...Object.values(MagicColor)))
        .min(1)
        .max(5)
        .required()
        .messages({
            'array.min': 'At least one color is required',
            'array.max': 'A deck cannot have more than 5 colors',
            'any.only': 'Invalid magic color'
        }),
        
    tierRating: Joi.string()
        .valid(...Object.values(TierRating))
        .required()
        .messages({
            'any.only': 'Tier rating must be S, A, B, C, or D'
        }),
        
    hasCardSleeves: Joi.boolean()
        .required()
        .messages({
            'any.required': 'Card sleeves status is required'
        }),
        
    isComplete: Joi.boolean()
        .required()
        .messages({
            'any.required': 'Completion status is required'
        }),
        
    deckType: Joi.string()
        .valid(...Object.values(DeckType))
        .required()
        .messages({
            'any.only': 'Deck type must be AGGRO, COMBO, or CONTROL'
        }),
        
    gameStage: Joi.string()
        .valid(...Object.values(GameStage))
        .required()
        .messages({
            'any.only': 'Game stage must be EARLY, MID, or LATE'
        }),
        
    storageLocation: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Storage location is required',
            'string.max': 'Storage location cannot exceed 100 characters'
        }),
        
    descriptiveImage: Joi.string()
        .uri()
        .optional()
        .messages({
            'string.uri': 'Descriptive image must be a valid URL'
        }),
        
    planeswalker: Joi.string()
        .trim()
        .max(50)
        .optional()
        .messages({
            'string.max': 'Planeswalker name cannot exceed 50 characters'
        })
});

const updateDeckSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .optional(),
        
    description: Joi.string()
        .trim()
        .min(1)
        .max(500)
        .optional(),
        
    colors: Joi.array()
        .items(Joi.string().valid(...Object.values(MagicColor)))
        .min(1)
        .max(5)
        .optional(),
        
    tierRating: Joi.string()
        .valid(...Object.values(TierRating))
        .optional(),
        
    hasCardSleeves: Joi.boolean().optional(),
    isComplete: Joi.boolean().optional(),
    
    deckType: Joi.string()
        .valid(...Object.values(DeckType))
        .optional(),
        
    gameStage: Joi.string()
        .valid(...Object.values(GameStage))
        .optional(),
        
    storageLocation: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .optional(),
        
    descriptiveImage: Joi.string()
        .uri()
        .optional(),
        
    planeswalker: Joi.string()
        .trim()
        .max(50)
        .optional()
}).min(1); 


export const validateCreateDeck = (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = createDeckSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true 
    });

    if (error) {
        const errorMessages = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
        }));

        res.status(400).json({
            success: false,
            message: 'Validation failed',
            error: 'VALIDATION_ERROR',
            details: errorMessages
        });
        return;
    }

    req.body = value;
    next();
};

export const validateUpdateDeck = (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = updateDeckSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        const errorMessages = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
        }));

        res.status(400).json({
            success: false,
            message: 'Validation failed',
            error: 'VALIDATION_ERROR',
            details: errorMessages
        });
        return;
    }

    req.body = value;
    next();
};

export const validateDeckId = (req: Request, res: Response, next: NextFunction): void => {
    const { id } = req.params;

    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    
    if (!id || !objectIdRegex.test(id)) {
        res.status(400).json({
            success: false,
            message: 'Invalid deck ID format',
            error: 'VALIDATION_ERROR'
        });
        return;
    }

    next();
};

export const validateSearchKeyword = (req: Request, res: Response, next: NextFunction): void => {
    const { keyword } = req.query;

    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
        res.status(400).json({
        success: false,
        message: 'Search keyword is required and must be a non-empty string',
        error: 'VALIDATION_ERROR'
        });
        return;
    }

    req.query.keyword = keyword.trim();
    next();
};

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction): void => {
    console.error('Error caught by middleware:', error);

    if (error.name === 'ValidationError') {
        const mongooseErrors = Object.values(error.errors).map((err: any) => ({
            field: err.path,
            message: err.message
        }));

        res.status(400).json({
            success: false,
            message: 'Validation failed',
            error: 'VALIDATION_ERROR',
            details: mongooseErrors
        });
        return;
    }

    if (error.name === 'CastError') {
        res.status(400).json({
            success: false,
            message: 'Invalid ID format',
            error: 'VALIDATION_ERROR'
        });
        return;
    }

    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        res.status(409).json({
            success: false,
            message: `${field} already exists`,
            error: 'CONFLICT'
        });
        return;
    }

    res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'INTERNAL_ERROR'
    });
};