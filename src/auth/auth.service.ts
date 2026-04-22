import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { RegisterUserDto } from './dto/register-user.dto';

import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto copy';

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
                    password: bcrypt.hashSync(password, 10),
                    name: name,
                }
            })

            // Extraigo el password renombrándolo a cualquier cosa (utilizo guiones bajos) y obtengo el 'resto' que es lo que me interesa
            const { password: ___, ...resto } = newUser;

            this.logger.log('Registrado nuevo usuario')
            return {
                user: resto,
                token: 'TODO:'
            };

        } catch (error) {
            throw new RpcException({
                status: 400,
                message: "Error registration",
            })
        }
    }

    async loginUser(loginUserDto: LoginUserDto) {
        try {
            const { email, password } = loginUserDto;

            const user = await this.user.findUnique({
                where: { email: email }
            })

            if (!user) {
                throw new RpcException({
                    status: 400,
                    message: 'Invalid Credentials'
                })
            }

            const isValidPassword = bcrypt.compareSync(password, user.password);

            if (!isValidPassword) {
                throw new RpcException({
                    status: 400,
                    message: 'Invalid Credentials'
                })
            }

            // Extraigo el password renombrándolo a cualquier cosa (utilizo guiones bajos) y obtengo el 'resto' que es lo que me interesa
            const { password: ___, ...rest } = user;

            this.logger.log('Login usuario ok')
            return {
                user: rest,
                token: 'TODO:'
            };

        } catch (error) {
            throw new RpcException({
                status: 400,
                message: error.message,
            })
        }
    }
}
