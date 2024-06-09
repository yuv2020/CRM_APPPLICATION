const express = require('express');
const passport = require('passport');

const config = require('../config');
const AuthService = require('../services/auth');
const ForbiddenError = require('../services/notifications/errors/forbidden');
const EmailSender = require('../services/email');
const wrapAsync = require('../helpers').wrapAsync;

const router = express.Router();

/**
 *  @swagger
 *  components:
 *    schemas:
 *      Auth:
 *        type: object
 *        required:
 *          - email
 *          - password
 *        properties:
 *          email:
 *            type: string
 *            default: admin@flatlogic.com
 *            description: User email
 *          password:
 *            type: string
 *            default: password
 *            description: User password
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authorization operations
 */

/**
 * @swagger
 *  /api/auth/signin/local:
 *    post:
 *      tags: [Auth]
 *      summary: Logs user into the system
 *      description: Logs user into the system
 *      requestBody:
 *        description: Set valid user email and password
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Auth"
 *      responses:
 *        200:
 *          description: Successful login
 *        400:
 *          description: Invalid username/password supplied
 *      x-codegen-request-body-name: body
 */

router.post(
  '/signin/local',
  wrapAsync(async (req, res) => {
    const payload = await AuthService.signin(
      req.body.email,
      req.body.password,
      req,
    );
    res.status(200).send(payload);
  }),
);

/**
 * @swagger
 *  /api/auth/me:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      tags: [Auth]
 *      summary: Get current authorized user info
 *      description: Get current authorized user info
 *      responses:
 *        200:
 *          description: Successful retrieval of current authorized user data
 *        400:
 *          description: Invalid username/password supplied
 *      x-codegen-request-body-name: body
 */

router.get(
  '/me',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    if (!req.currentUser || !req.currentUser.id) {
      throw new ForbiddenError();
    }

    const payload = req.currentUser;
    delete payload.password;
    res.status(200).send(payload);
  },
);

router.put(
  '/password-reset',
  wrapAsync(async (req, res) => {
    const payload = await AuthService.passwordReset(
      req.body.token,
      req.body.password,
      req,
    );
    res.status(200).send(payload);
  }),
);

router.put(
  '/password-update',
  passport.authenticate('jwt', { session: false }),
  wrapAsync(async (req, res) => {
    const payload = await AuthService.passwordUpdate(
      req.body.currentPassword,
      req.body.newPassword,
      req,
    );
    res.status(200).send(payload);
  }),
);
