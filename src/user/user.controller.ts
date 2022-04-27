import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { User as UserModel } from '@prisma/client';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    // @Post()
    // create(@Body() createUserDto: any) {
    //     return this.userService.create(createUserDto);
    // }

    @Post('signup')
    async signup(@Body() userData: { name?: string; email: string }): Promise<any> {
        // return this.userService.create(userData);
    }

    // @Get()
    // findAll() {
    //     return this.userService.findAll();
    // }

    @Get(':email')
    findOne(@Param('email') email: string) {
        return this.userService.findOne({ email });
    }

    // @Patch(':id')
    // update(@Param('id') id: string, @Body() updateUserDto: any) {
    //     return this.userService.update(+id, updateUserDto);
    // }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.userService.remove({ id });
    }
}
