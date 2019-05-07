export {};
const httpStatus = require('http-status');
const passport = require('passport');
import { User } from 'api/models';
const APIError = require('../utils/APIError');

const ADMIN_SUPER = 'admin_super';
const ADMIN_IMPORT = 'admin_import';
const ADMIN_OP = 'admin_op';

const LOGGED_USER = '_loggedUser';

import * as Bluebird from 'bluebird';
// declare global {
//   export interface Promise<T> extends Bluebird<T> {}
// }

const handleJWT = (req: any, res: any, next: any, roles: any) => async (err: any, user: any, info: any) => {
  const error = err || info;
  const logIn: any = Bluebird.promisify(req.logIn);
  const apiError = new APIError({
    message: error ? error.message : 'Unauthorized',
    status: httpStatus.UNAUTHORIZED,
    stack: error ? error.stack : undefined
  });

  try {
    if (error || !user) {
      throw error;
    }
    await logIn(user, { session: false });
  } catch (e) {
    return next(apiError);
  }
 console.log("35 roles ",roles)
  if (roles.includes(LOGGED_USER)) {

    if (user.role.startsWith( 'admin') == false && req.params.userId !== user._id.toString()) {
      apiError.status = httpStatus.FORBIDDEN;
      apiError.message = 'Forbidden';
      return next(apiError);
    }
  } else if (!roles.includes(user.role)) {
    apiError.status = httpStatus.FORBIDDEN;
    apiError.message = 'Forbidden';
    return next(apiError);
  } else if (err || !user) {
    return next(apiError);
  }

  req.route.meta = req.route.meta || {};
  req.route.meta.user = user;

  return next();
};

exports.ADMIN_SUPER = ADMIN_SUPER;
exports.ADMIN_OP = ADMIN_OP;
exports.ADMIN_IMPORT = ADMIN_IMPORT;

exports.LOGGED_USER = LOGGED_USER;

exports.authorize = (roles = User.roles) => (req: any, res: any, next: any) =>{
  console.log("64 roles ",roles)
  // console.log(req)
  return passport.authenticate('jwt', { session: false }, handleJWT(req, res, next, roles))(req, res, next);
}


exports.oAuth = (service: any) => passport.authenticate(service, { session: false });
