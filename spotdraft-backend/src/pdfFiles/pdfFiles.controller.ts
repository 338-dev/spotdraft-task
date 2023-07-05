import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Headers } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { FileEntity } from 'src/entity/files.entity';
import { FilesService } from './pdfFiles.service';
import { AuthGuard } from 'src/guards/auth.guard';
import {
  schemaCreateFile,
  schemaEmail,
  schemaShareWithUsers,
} from 'src/Joi/dataValidation';

@Controller('/file')
export class FilesController {
  constructor(
    private readonly fileService: FilesService,
    private jwtService: JwtService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('create')
  async createUniqueUrls(
    @Body() fileDetails: Partial<FileEntity>,
    @Headers() headers,
  ) {
    const token = headers.jwt;
    const decoded: any = jwt.verify(token, 'secret');
    const id = decoded.id;

    const result = schemaCreateFile.validate({
      url: fileDetails?.url,
      name: fileDetails?.name,
      size: fileDetails?.size,
      lastModified: fileDetails?.lastModified,
    });

    const { error } = result;
    if (error) {
      throw new BadRequestException(result.error.message);
    }

    console.log(id, token);

    return await this.fileService.createUrls({
      ...fileDetails,
      owner: id,
    });
  }

  @UseGuards(AuthGuard)
  @Get('viewAll')
  async getAll(@Headers() headers): Promise<FileEntity[]> {
    const token = headers.jwt;
    const decoded: any = jwt.verify(token, 'secret');
    const id = decoded.id;

    return await this.fileService.findAll(id);
  }
  @Get('view/:uuid')
  async getByUuid(
    @Param('uuid') uuid,
    @Headers() headers,
  ): Promise<FileEntity[]> {
    const token = headers?.jwt;
    let decoded;
    try {
      decoded = jwt.verify(token, 'secret');
    } catch (error) {
      console.log(error);
    }
    const userId = decoded?.id;
    const isAuthenticated = userId ? true : false;
    console.log(userId, uuid, isAuthenticated);
    return await this.fileService.findByUuid(userId, uuid, isAuthenticated);
  }

  @UseGuards(AuthGuard)
  @Put('share/:id')
  async updateShareWith(
    @Param('id') fileUuid,
    @Headers() headers,
    @Body() emailOfReceiver,
  ): Promise<FileEntity[]> {
    const token = headers.jwt;
    const decoded: any = jwt.verify(token, 'secret');
    const userId = decoded.id;

    const result = schemaEmail.validate({ email: emailOfReceiver?.email });

    const { error } = result;
    if (error) {
      throw new BadRequestException(result.error.message);
    }
    return await this.fileService.updateById(
      userId,
      fileUuid,
      emailOfReceiver?.email,
    );
  }
  @UseGuards(AuthGuard)
  @Put('sharewithType/:id')
  async updateShareWithAll(
    @Param('id') fileUuid,
    @Headers() headers,
    @Body()
    toBeShareWith: {
      shareWithEveryOne: boolean;
      shareWithAllAuthenticated: boolean;
    },
  ): Promise<FileEntity[]> {
    const token = headers.jwt;
    const decoded: any = jwt.verify(token, 'secret');
    const userId = decoded.id;

    const result = schemaShareWithUsers.validate({
      shareWithEveryOne: toBeShareWith?.shareWithEveryOne,
      shareWithAllAuthenticated: toBeShareWith?.shareWithAllAuthenticated,
    });

    const { error } = result;
    if (error) {
      throw new BadRequestException(result.error.message);
    }

    return await this.fileService.updateShareWithType(
      userId,
      fileUuid,
      toBeShareWith,
    );
  }
  @UseGuards(AuthGuard)
  @Get('viewAll/shared')
  async getAllShared(@Headers() headers): Promise<FileEntity[]> {
    const token = headers.jwt;
    const decoded: any = jwt.verify(token, 'secret');
    const id = decoded.id;

    return await this.fileService.findAllShared(id);
  }

  @UseGuards(AuthGuard)
  @Put('comments/:uuid')
  async comments(
    @Param('uuid') fileUuid,
    @Headers() headers,
    @Body()
    comment: {
      comment: string;
    },
  ): Promise<FileEntity[]> {
    const token = headers.jwt;
    const decoded: any = jwt.verify(token, 'secret');
    const userId = decoded.id;
    const isAuthenticated = userId ? true : false;

    console.log(comment);
    if (comment?.comment?.length >= 3)
      return await this.fileService.updateComments(
        userId,
        fileUuid,
        comment.comment,
        isAuthenticated,
      );
    else throw new BadRequestException('missing necessary parameters');
  }
}
