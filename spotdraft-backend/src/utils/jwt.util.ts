import * as jwt from 'jsonwebtoken';
import { UserEntity } from 'src/entity/user.entity';

export default class JwtUtil {
  static getJwtToken(user: UserEntity) {
    const token = jwt.sign(
      {
        id: user.id,
        time: Date.now(),
      },
      'secret',
      {
        expiresIn: '5h',
      },
    );
    return token;
  }
}
