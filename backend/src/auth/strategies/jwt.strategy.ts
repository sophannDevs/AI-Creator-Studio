import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secretOrKey = process.env.JWT_SECRET ?? 'dev-only-secret-change-me';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey,
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    if (!payload?.userId || !payload?.email) {
      throw new UnauthorizedException('Invalid token payload.');
    }

    return payload;
  }
}
