const express = require('express');
const db = require('../db/models');
const wrapAsync = require('../helpers').wrapAsync;
const router = express.Router();
const sjs = require('sequelize-json-schema');
const { getWidget } = require('../services/openai');
const RolesService = require('../services/roles');

/**
 * @swagger
 * /api/roles/roles-info/{infoId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags: [Roles]
 *     summary: Remove role information by ID
 *     description: Remove specific role information by ID
 *     parameters:
 *       - in: path
 *         name: infoId
 *         description: ID of role information to remove
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         description: ID of the user
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: key
 *         description: Key of the role information to remove
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role information successfully removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: string
 *                   description: The user information
 *       400:
 *         description: Invalid ID or key supplied
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       404:
 *         description: Role not found
 *       500:
 *         description: Some server error
 */

router.delete(
  '/roles-info/:infoId',
  wrapAsync(async (req, res) => {
    const role = await RolesService.removeRoleInfoById(
      req.query.infoId,
      req.query.roleId,
      req.query.key,
      req.currentUser,
    );

    res.status(200).send(role);
  }),
);