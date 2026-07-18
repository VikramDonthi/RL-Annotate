const express = require('express');
const router = express.Router();
const annotationController = require('../controllers/annotationController');
const auth = require('../middleware/auth');

// Protect all annotation routes
router.use(auth);

router.post('/', annotationController.createAnnotation);
router.get('/', annotationController.getAnnotations);
router.put('/:id/verify', annotationController.verifyAnnotation);
router.get('/stats', annotationController.getStats);
router.get('/optimize-prompt', annotationController.optimizePrompt);
router.post('/update-prompt', annotationController.updatePrompt);

module.exports = router;
