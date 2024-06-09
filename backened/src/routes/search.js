const express = require('express');
const SearchService = require('../services/search');

const router = express.Router();

const { checkCrudPermissions } = require('../middlewares/check-permissions');
router.use(checkCrudPermissions('search'));

/**
 * @swagger
 * path:
 *  /api/search:
 *    post:
 *      summary: Search
 *      description: Search results across multiple tables
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                searchQuery:
 *                  type: string
 *              required:
**/