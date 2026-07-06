import { Controller, Post, Body, UseGuards, Get, Req } from "@nestjs/common";
import { UsersService } from "./users.service";
import { RegisterUserDto } from "./dto/register-user.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("users")
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Post()
    async createUser(
        @Body() dto: RegisterUserDto
    ) {
        return this.usersService.create(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get("me")
    async getMe(@Req() req) {
        const user = await this.usersService.findById(req.user.userId);
        if (!user) {
            return null;
        }
        return {
            id: user.id,
            email: user.email,
            name: user.name,
        };
    }
}
