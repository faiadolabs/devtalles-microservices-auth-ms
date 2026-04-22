import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {

    private readonly logger = new Logger('AuthService')

    onModuleInit() {
        this.$connect();
        this.logger.log('MongoDB Connected')
    }

    async registerUser(registerUserDto: RegisterUserDto) {
        try {
            const { name, email, password } = registerUserDto;

            const user = await this.user.findUnique({
                where: {
                    email: email
                }
            })

            if (user) {
                throw new RpcException({
                    status: 400,
                    message: 'User already exists'
                })
            }

            const newUser = await this.user.create({
                data: {
                    email: email,
                    password: password,
                    name: name,
                }
            })

            this.logger.log('Registrado nuevo usuario')
            return {
                user: { ...newUser },
                token: 'TODO:'
            };

        } catch (error) {
            throw new RpcException({
                status: 400,
                message: "Error registration",
            })
        }
    }

}
