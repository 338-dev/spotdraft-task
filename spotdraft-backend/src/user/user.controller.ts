import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserEntity } from 'src/entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import JwtUtil from 'src/utils/jwt.util';
import { schemaRegister, schemaLogin } from 'src/Joi/dataValidation';

@Controller('/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() userData: UserEntity): Promise<any> {
    let { name, email, password } = userData;

    name = name?.trim();
    email = email?.trim()?.toLowerCase();

    const result = schemaRegister.validate({
      name: name,
      email: email,
      password: password,
    });

    const { error } = result;
    if (error) {
      throw new BadRequestException(result.error.message);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    return await this.userService.create({
      name: name,
      email: email,
      password: hashedPassword,
    });
  }

  @Post('login')
  async userLogin(
    @Body() userData: UserEntity,
    @Res({ passthrough: true }) response: Response,
  ) {
    let { email, password } = userData;

    email = email?.trim().toLowerCase();

    const result = schemaLogin.validate({ email: email, password: password });

    const { error } = result;
    if (error) {
      throw new BadRequestException(result.error.message);
    }

    const user = await this.userService.userLogin({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('invalid credentials');
    }

    const token = JwtUtil.getJwtToken(user);

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return {
      tokenExpirationTime: tomorrow,
      jwt: token,
      user: { name: user.name, email: user.email },
    };
  }
}
