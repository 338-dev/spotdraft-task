import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Reflector } from '@nestjs/core';
import { UserEntity } from 'src/entity/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    try {
      const token = request.headers.jwt;
      const decoded: any = jwt.verify(token, 'secret');

      const id = decoded.id;
      const user = await UserEntity.findOne({ where: { id } });
      if (user) {
        request.authUser = user;
      }
      return true;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
