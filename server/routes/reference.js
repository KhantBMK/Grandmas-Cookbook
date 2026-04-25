const express = require('express');
const router = express.Router();
const {getCuisines, getMealTypes, getTags} = require('../controllers/reference');

router.get('/cuisines', getCuisines);
router.get('/meal-types', getMealTypes);
router.get('/tags', getTags);

module.exports = router;
