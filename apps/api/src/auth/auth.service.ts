import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    const hashedPassword = user?.passwordHash;
    const credentialsOk = user && hashedPassword && (await bcrypt.compare(password, hashedPassword));

    if (!credentialsOk) {
      throw new UnauthorizedException('Credenciales Invalidas');
    }

    const { id, email: userEmail, name } = user;
    return { id, email: userEmail, name };
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }
}
    