import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/entity/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { FileEntity } from 'src/entity/files.entity';
import { FilesService } from 'src/pdfFiles/pdfFiles.service';
import { FilesController } from 'src/pdfFiles/pdfFiles.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, FileEntity]),
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '5h' },
    }),
  ],
  providers: [UserService, FilesService],
  controllers: [UserController, FilesController],
})
export class UserModule {}
