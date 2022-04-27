import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { UserAttributes } from 'src/user/interfaces/user-attributes.interface';
import { UserService } from '../user/user.service';

/** generates 7 digit number */
const generateNumber = () => {
    return (Math.floor(Math.random() * 9000000) + 1000000).toString(); //Generate 7 digits number
};

@Injectable()
export class AuthService {
    constructor(private userService: UserService, private jwtService: JwtService) {}

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.userService.findOne({ email: username });
        if (user && user.password === pass) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.userId };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    /** creates email token and timestamp on attributes json field */
    async createEmailToken(email: string) {
        const emailAttributes = {
            token: generateNumber(),
            timestamp: new Date().toISOString(),
        };

        return await this.userService.update({
            where: { email },
            data: {
                attributes: {
                    email: emailAttributes,
                },
            },
        });
    }

    /** sends an email verification to the user */
    async sendEmailVerification(email: string) {
        const { attributes, ...user } = await this.userService.findOne({ email });

        // TODO: figure out typing on json fields in postgres
        if ((attributes as unknown as UserAttributes)?.email?.token) {
            // TODO: create mail service
            // TODO: create config service
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: +process.env.EMAIL_PORT,
                secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            const mailOptions = {
                from: '"Company" <' + process.env.EMAIL_USER + '>',
                to: email, // list of receivers (separated by ,)
                subject: 'Verify Email',
                text: 'Verify Email',
                html:
                    'Hi! <br><br> Thanks for your registration<br><br>' +
                    '<a href=' +
                    process.env.HOST_URL +
                    ':' +
                    process.env.HOST_PORT +
                    '/auth/verify/' +
                    (attributes as unknown as UserAttributes).email.token +
                    '>Click here to activate your account</a>', // html body
            };

            const sent = await new Promise<boolean>(async function (resolve, reject) {
                return await transporter.sendMail(mailOptions, async (error, info) => {
                    if (error) {
                        console.log('Message sent: %s', error);
                        return reject(false);
                    }
                    console.log('Message sent: %s', info.messageId);
                    resolve(true);
                });
            });

            return sent;
        }
    }

    /** finds the user by token and will mark user email as valid */
    async verifyEmail(token: string): Promise<boolean> {
        const user = await this.userService.findByToken(token);
        if (!user.email) {
            return false;
        }

        const updatedUser = await this.userService.update({
            where: { email: user.email },
            data: {
                attributes: {
                    email: { isValid: true },
                },
            },
        });

        return (updatedUser.attributes as unknown as UserAttributes).email.isValid;
    }
}
