import { HttpException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entity/user.entity';
import JwtUtil from 'src/utils/jwt.util';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async findAll(pg: any): Promise<any> {
    const Users = await this.userRepository.find();
    const len = Math.floor((Users.length - 1) / 7 + 1);
    return [Users.splice((pg - 1) * 7, 7), len];
  }

  async create(user: UserEntity | any) {
    const newUser = await this.userRepository.findOne({
      where: { email: user.email },
    });

    if (newUser) {
      throw new HttpException('User already registered', 400);
    } else {
      await this.userRepository.save(user);
      const token = JwtUtil.getJwtToken(user);

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      return {
        jwt: token,
        tokenExpirationTime: tomorrow,
        user: {
          email: user.email,
          name: user.name,
        },
      };
    }
  }

  async userLogin({ email }: { email: string }): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { email: email } });

    if (!user) {
      throw new HttpException('invalid credetials', 400);
    } else {
      return user;
    }
  }
}
