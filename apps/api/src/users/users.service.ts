import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import bcrypt from "bcrypt";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private repo: Repository<User>
    ) { }

    async create(email: string, name: string, password: string) {
        const passwordHash = await bcrypt.hash(password, 10);
        const user = this.repo.create({ email, name, passwordHash });
        const saved = await this.repo.save(user);
        return { id: saved.id, email: saved.email, name: saved.name };
    }

}