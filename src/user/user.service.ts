import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { isValidEmail } from 'src/utils/is-valid-email';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDS } from 'src/common/constants';
import { UserAttributes } from './interfaces/user-attributes.interface';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async create(user: Prisma.UserCreateInput): Promise<User> {
        if (isValidEmail(user.email) && user.password) {
            const userRegistered = await this.findOne({ email: user.email });
            if (!userRegistered) {
                user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
                user.attributes = this.getAttributes();
                return this.prisma.user.create({ data: user });
            } else if (!userRegistered.validEmail) {
                return userRegistered;
            } else {
                throw new HttpException('USER_ALREADY_REGISTERED', HttpStatus.FORBIDDEN);
            }
        }
    }

    async findOne(user: Prisma.UserWhereUniqueInput): Promise<User | null> {
        return this.prisma.user.findUnique({ where: user });
    }

    findAll(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.UserWhereUniqueInput;
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.UserOrderByWithRelationInput;
    }): Promise<User[]> {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.user.findMany({ skip, take, cursor, where, orderBy });
    }

    update(params: { where: Prisma.UserWhereUniqueInput; data: Prisma.UserUpdateInput }): Promise<User> {
        const { where, data } = params;
        return this.prisma.user.update({ data, where });
    }

    remove(where: Prisma.UserWhereUniqueInput): Promise<User> {
        return this.prisma.user.delete({ where });
    }

    async findByToken(token: string) {
        const users = await this.prisma.user.findMany({
            where: {
                attributes: {
                    path: ['email', 'token'],
                    equals: token,
                },
            },
        });

        return users.length ? users[0] : undefined;
    }

    private getAttributes(): Prisma.JsonObject {
        return {
            isValid: false,
            email: {
                token: '',
            },
        };
    }
}
