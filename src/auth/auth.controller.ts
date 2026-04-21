import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @MessagePattern('auth.register.user')
  registerUser(){
    return 'registerUser'
  }

  @MessagePattern('auth.login.user')
  loginUser(){
    return 'loginUser'
  }

  @MessagePattern('auth.verify.user')
  validateUser(){
    return 'validateUser'
  }
}
