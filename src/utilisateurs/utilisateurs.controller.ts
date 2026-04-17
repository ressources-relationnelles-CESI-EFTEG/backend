import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { unlink } from 'fs/promises';
import { UtilisateursService } from './utilisateurs.service';
import { UpdateUtilisateurDto } from './dto/update-utilisateur.dto';
import { Roles } from '../auth/roles.decorator';

@Controller('utilisateurs')
export class UtilisateursController {
  constructor(private readonly utilisateursService: UtilisateursService) {}

  @Roles('ADMINISTRATEUR', 'SUPER_ADMIN')
  @Get()
  findAll(@Query('search') search?: string) {
    return this.utilisateursService.findAll(search);
  }

  @Get('search')
  searchForMessaging(@Query('q') q: string) {
    if (!q || q.trim().length < 2) return [];
    return this.utilisateursService.searchForMessaging(q.trim());
  }
  
  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.utilisateursService.findById(id);
  }

  @Roles('ADMINISTRATEUR', 'SUPER_ADMIN')
  @Patch(':id/statut')
  updateStatut(
    @Param('id', ParseIntPipe) id: number,
    @Body('statut') statut: string,
  ) {
    return this.utilisateursService.updateStatut(id, statut);
  }

  @Roles('ADMINISTRATEUR', 'SUPER_ADMIN')
  @Patch(':id/role')
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: string,
  ) {
    return this.utilisateursService.updateRole(id, role);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUtilisateurDto,
  ) {
    return this.utilisateursService.update(id, dto);
  }

  @Post(':id/photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `photo-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new BadRequestException('Le fichier doit être une image.'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async uploadPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier envoyé.');
    }

    const photoPath = `/uploads/${file.filename}`;
    return this.utilisateursService.update(id, { photoProfil: photoPath });
  }

  @Delete(':id/photo')
  async deletePhoto(@Param('id', ParseIntPipe) id: number) {
    const user = await this.utilisateursService.findById(id);

    if (user.photoProfil) {
      const filePath = join(process.cwd(), user.photoProfil);
      try {
        await unlink(filePath);
      } catch {
        // fichier déjà supprimé ou introuvable, on continue
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return this.utilisateursService.update(id, { photoProfil: null as any });
  }

  @Roles('ADMINISTRATEUR', 'SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.utilisateursService.remove(id);
  }
}
