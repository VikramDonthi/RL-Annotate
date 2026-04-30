const express = require('express');
const router = express.Router();
const annotationController = require('../controllers/annotationController');

router.post('/', annotationController.createAnnotation);
router.get('/', annotationController.getAnnotations);
router.put('/:id/verify', annotationController.verifyAnnotation);
router.get('/stats', annotationController.getStats);
router.get('/optimize-prompt', annotationController.optimizePrompt);
router.post('/update-prompt', annotationController.updatePrompt);

module.exports = router;
