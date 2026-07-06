import { Controller, Post, Body } from "@nestjs/common";
import { UsersService } from "./users.service";
import { RegisterUserDto } from "./dto/register-user.dto";

@Controller("users")
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Post()
    async createUser(
        @Body() dto: RegisterUserDto
    ) {
        return this.usersService.create(dto);
    }

}