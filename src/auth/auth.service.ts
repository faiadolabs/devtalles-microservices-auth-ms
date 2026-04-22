import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { RegisterUserDto } from './dto/register-user.dto';

import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto copy';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {

    private readonly logger = new Logger('AuthService')

    constructor(
        private readonly jwtService: JwtService,
    ) { super() }

    onModuleInit() {
        this.$connect();
        this.logger.log('MongoDB Connected')
    }

    async signJWT(payload: JwtPayload) {
        return this.jwtService.sign(payload);
    }

    async verifyToken(token: string) {
        try {
            // 💡 Here the JWT secret key that's used for verifying the payload 
            // is the key that was passed in the JwtModule
            const payload = await this.jwtService.verify(token);

            // Extraigo todos los datos que no voy a poder usar para generar un nuevo token
            const { sub, iat, exp, ...user } = payload;

            this.logger.log(`Token de ${user.name} verificado y regenerado`);
            return {
                user,
                token: await this.signJWT(user), // genero un nuevo token regenerando el tiempo de conexión autorizada del usuario
            }

        } catch (error) {
            throw new RpcException({
                status: 401,
                message: 'Invalid token'
            })
        }
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
                token: await this.signJWT(resto),
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
                token: await this.signJWT(rest),
            };

        } catch (error) {
            throw new RpcException({
                status: 400,
                message: error.message,
            })
        }
    }
}
