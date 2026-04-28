import { variables } from '@/config';
import { StatusEnum } from '@/constants';
import prisma from '@/infra/database/prisma/prisma.client';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

const opts = {
  jwt: {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: variables.JWT_SECRET,
  },
};

export default {
  initialize: () => {
    passport.use(
      'superAdmin',
      new JwtStrategy(opts.jwt, (jwtPayload, done) => {
        prisma.superAdmin
          .findFirst({
            where: {
              id: jwtPayload,
              isDeleted: false,
              status: StatusEnum.ACTIVE,
            },
            select: {
              id: true,
              name: true,
              email: true,
              roleId: true,
            },
          })
          .then((u: any) => {
            if (u) {
              // u = u.toJSON();
              u.isSuperAdmin = true;
              done(null, u);
            } else done(null, false);
          })
          .catch((e) => {
            console.log(e);
            done(e, false);
          });
      }),
    );

    passport.use(
      'domain',
      new JwtStrategy(opts.jwt, (jwtPayload, done) => {
        prisma.domain
          .findFirst({
            where: {
              id: jwtPayload,
              isDeleted: false,
              status: StatusEnum.ACTIVE,
            },
            select: {
              id: true,
              name: true,
              email: true,
              roleId: true,
            },
          })
          .then((u: any) => {
            if (u) {
              // u = u.toJSON();
              u.domainId = u.id;
              u.isSuperAdmin = false;
              done(null, u);
            } else done(null, false);
          })
          .catch((e) => {
            console.log(e);
            done(e, false);
          });
      }),
    );

    passport.use(
      'user',
      new JwtStrategy(opts.jwt, (jwtPayload, done) => {
        prisma.user
          .findFirst({
            where: {
              id: jwtPayload,
              isDeleted: false,
              status: StatusEnum.ACTIVE,
            },
            select: {
              id: true,
              name: true,
              email: true,
              roleId: true,
              domainId: true,
              status: true,
            },
          })
          .then((u: any) => {
            if (u) {
              u.isSuperAdmin = false;
              done(null, u);
            } else done(null, false);
          })
          .catch((e) => {
            console.log(e);
            done(e, false);
          });
      }),
    );
  },
  pass: () => {
    return passport;
  },
};
