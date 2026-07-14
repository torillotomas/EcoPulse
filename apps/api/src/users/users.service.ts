import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(dto: RegisterUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.repo.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });
    const saved = await this.repo.save(user);
    return { id: saved.id, email: saved.email, name: saved.name };
  }

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }
}
