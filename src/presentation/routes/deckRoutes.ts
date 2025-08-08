import { Router } from 'express';
import { DeckController } from '../controllers/DeckController';

export function createDeckRoutes(deckController: DeckController): Router {
    const router = Router();

    // * CRUD ROUTES
    router.post('/', deckController.createDeck);
    router.get('/', deckController.getAllDecks);
    router.get('/:id', deckController.getDeckById);
    router.put('/:id', deckController.updateDeck);
    router.delete('/:id', deckController.deleteDeck);

    // * SEARCH ROUTES
    router.get('/search/keyword', deckController.searchDecks);
    router.get('/filter/incomplete', deckController.getIncompleteDecks);
    router.get('/location/:location', deckController.getDecksByLocation);

    return router;
}
