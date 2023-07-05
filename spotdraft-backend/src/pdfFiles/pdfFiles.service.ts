import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entity/user.entity';
import { FileEntity } from 'src/entity/files.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async createUrls(file: Partial<FileEntity>) {
    const newFile = await this.fileRepository.findOne({
      where: { url: file.url },
    });

    if (newFile) {
      console.log(newFile);
      throw new HttpException('File Already saved in database', 400);
    } else {
      const uuid = uuidv4();
      return await this.fileRepository.save({ ...file, securedUuid: uuid });
    }
  }

  async findAll(id: number): Promise<any> {
    const allFiles = await this.fileRepository.find();

    const filesByUser = allFiles.filter((element) => {
      return element.owner === id;
    });

    return filesByUser;
  }
  async findByUuid(
    userId: number,
    uuid: string,
    isAuthenticated: boolean,
  ): Promise<any> {
    console.log(uuid, 1);
    const fileDetails = await this.fileRepository.findOne({
      where: { securedUuid: uuid },
    });

    console.log(fileDetails);
    if (
      fileDetails?.shareWithEveryOne ||
      fileDetails?.owner === userId ||
      fileDetails?.sharedWith?.split(',')?.includes(String(userId)) ||
      (fileDetails?.shareWithAllAuthenticated && isAuthenticated)
    ) {
      return fileDetails;
    } else {
      throw new UnauthorizedException();
    }
  }

  async updateById(
    userId: number,
    fileUuid: string,
    emailOfReceiver: string,
  ): Promise<any> {
    const fileDetails = await this.fileRepository.findOne({
      where: { securedUuid: fileUuid },
    });
    const receiverDetails = await this.userRepository.findOne({
      where: { email: emailOfReceiver },
    });

    const receiverId = receiverDetails?.id;

    if (fileDetails?.owner === userId) {
      if (!receiverId || receiverId === userId) {
        console.log(receiverId);
        throw new HttpException('Enter different email', 400);
      } else {
        let { sharedWith } = fileDetails;

        if (sharedWith === null) {
          sharedWith = String(receiverId);
        } else if (!sharedWith.split(',').includes(String(receiverId))) {
          const sharedWithArr = sharedWith.split(',');
          sharedWithArr.push(String(receiverId));
          sharedWith = String(sharedWithArr);
        }

        return await this.fileRepository.update(fileDetails.id, {
          ...fileDetails,
          sharedWith: sharedWith,
        });
      }
    } else {
      throw new UnauthorizedException();
    }
  }

  async updateShareWithType(
    userId: number,
    fileUuid: string,
    toBeShareWith: {
      shareWithEveryOne: boolean;
      shareWithAllAuthenticated: boolean;
    },
  ): Promise<any> {
    const fileDetails = await this.fileRepository.findOne({
      where: { securedUuid: fileUuid },
    });

    if (fileDetails?.owner === userId) {
      console.log(toBeShareWith);
      await this.fileRepository.update(fileDetails.id, {
        ...fileDetails,
        ...toBeShareWith,
      });
      const allFiles = await this.fileRepository.find();

      const filesByUser = allFiles.filter((element) => {
        return element.owner === userId;
      });

      return filesByUser;
    } else {
      throw new UnauthorizedException();
    }
  }

  async findAllShared(id: number): Promise<any> {
    const allFiles = await this.fileRepository.find();

    const filesByUser = allFiles.filter((element) => {
      if (element?.sharedWith)
        return element.sharedWith.split(',')?.includes(String(id));
      else return false;
    });

    return filesByUser;
  }

  async updateComments(
    userId: number,
    fileUuid: string,
    comment: string,
    isAuthenticated: boolean,
  ): Promise<any> {
    const fileDetails = await this.fileRepository.findOne({
      where: { securedUuid: fileUuid },
    });

    const userDetails = await this.userRepository.findOne({
      where: { id: userId },
    });
    const userName = userDetails?.name;
    if (
      fileDetails?.owner === userId ||
      fileDetails?.sharedWith?.split(',')?.includes(String(userId)) ||
      (fileDetails?.shareWithAllAuthenticated && isAuthenticated)
    ) {
      if (fileDetails.comments === null) {
        await this.fileRepository.update(fileDetails.id, {
          ...fileDetails,
          comments: JSON.stringify([{ [userName]: comment }]),
        });
      } else {
        const tempComments = JSON.parse(fileDetails.comments);
        tempComments.push({ [userName]: comment });
        await this.fileRepository.update(fileDetails.id, {
          ...fileDetails,
          comments: JSON.stringify(tempComments),
        });
      }
      const allFiles = await this.fileRepository.find();

      const filesByUser = allFiles.filter((element) => {
        return element.owner === userId;
      });

      return filesByUser;
    } else {
      throw new UnauthorizedException();
    }
  }
}
