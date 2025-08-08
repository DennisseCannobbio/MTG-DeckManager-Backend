import { Schema, model, Document, Types } from 'mongoose';
import { MagicColor, TierRating, DeckType, GameStage } from '@domain/entities/Deck';

export interface DeckDocument extends Document {
    _id: Types.ObjectId;
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

const DeckSchema = new Schema<DeckDocument>(
    {
        name: {
            type: String,
            required: [true, 'Deck name is required'],
            trim: true,
            maxlength: [100, 'Deck name cannot exceed 100 characters'],
            unique: true,
            index: true 
        },
        description: {
            type: String,
            required: [true, 'Deck description is required'],
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters']
        },
        colors: {
            type: [String],
            required: [true, 'At least one color is required'],
            enum: {
                values: Object.values(MagicColor),
                message: 'Invalid magic color: {VALUE}'
            },
        validate: {
                validator: function(colors: MagicColor[]) {
                    return colors.length > 0 && colors.length <= 5; 
                },
                message: 'A deck must have between 1 and 5 colors'
        }
        },
        tierRating: {
            type: String,
            required: [true, 'Tier rating is required'],
            enum: {
                values: Object.values(TierRating),
                message: 'Invalid tier rating: {VALUE}'
            },
            index: true 
        },
        hasCardSleeves: {
            type: Boolean,
            required: true,
            default: false
        },
        isComplete: {
            type: Boolean,
            required: true,
            default: false,
            index: true 
        },
        descriptiveImage: {
            type: String,
            trim: true,
            validate: {
                validator: function(url: string) {
                    if (!url) return true; 
                    return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                },
                message: 'Invalid image URL format'
            }
        },
        deckType: {
            type: String,
            required: [true, 'Deck type is required'],
            enum: {
                values: Object.values(DeckType),
                message: 'Invalid deck type: {VALUE}'
            },
            index: true
        },
        gameStage: {
            type: String,
            required: [true, 'Game stage is required'],
            enum: {
                values: Object.values(GameStage),
                message: 'Invalid game stage: {VALUE}'
            },
            index: true
        },
        storageLocation: {
            type: String,
            required: [true, 'Storage location is required'],
            trim: true,
            maxlength: [100, 'Storage location cannot exceed 100 characters'],
            index: true 
        },
        planeswalker: {
            type: String,
            trim: true,
            maxlength: [50, 'Planeswalker name cannot exceed 50 characters']
        }
    },
    {
        timestamps: true, 
        collection: 'decks' 
    }
);

DeckSchema.index({ deckType: 1, gameStage: 1 });
DeckSchema.index({ tierRating: 1, isComplete: 1 }); 
DeckSchema.index({ storageLocation: 1, isComplete: 1 }); 

DeckSchema.index({
    name: 'text',
    description: 'text',
    planeswalker: 'text'
}, {
    weights: {
        name: 3,      
        planeswalker: 2,
        description: 1
    }
});

DeckSchema.pre('save', function(next) {
    this.name = this.name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
    next();
});

DeckSchema.statics.findByTierRating = function(tierRating: TierRating) {
    return this.find({ tierRating });
};

DeckSchema.statics.findIncomplete = function() {
    return this.find({ isComplete: false });
};

DeckSchema.statics.findByStorageLocation = function(location: string) {
    return this.find({ storageLocation: new RegExp(location, 'i') });
};

export const DeckModel = model<DeckDocument>('Deck', DeckSchema);