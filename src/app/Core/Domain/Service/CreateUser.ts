import bcrypt from 'bcrypt';
import { validate } from 'class-validator';
import { AppError } from '@util/appError.util';
import { CreateUserDto } from '../Dto/CreateUserDto';
import { userRepository } from '../Repository/UserRepository';
import { User } from '../Entity/User';

export class CreateUser {
    public async execute(createUserDto: CreateUserDto): Promise<User> {
        const userAlreadyExists = await userRepository.findOneBy({
            email: createUserDto.email,
        });
        if (userAlreadyExists != null) {
            throw new AppError('Já existe usuário com esse email!');
        }

        const passwordHash: string = bcrypt.hashSync(
            createUserDto.password,
            bcrypt.genSaltSync(10),
        );

        const user = userRepository.create({
            email: createUserDto.email,
            password: passwordHash,
            name: createUserDto.name,
        });

        const errors = await validate(user);
        if (errors.length > 0) {
            throw new AppError('Ocorreu um erro. Tente Novamente');
        } else {
            await userRepository.save(user);
        }
        return user;
    }
}
