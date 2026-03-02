import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UtilisateursModule } from './utilisateurs/utilisateurs.module';
import { RessourcesModule } from './ressources/ressources.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { CommentairesModule } from './commentaires/commentaires.module';
import { FavorisModule } from './favoris/favoris.module';
import { ProgressionsModule } from './progressions/progressions.module';
import { SignalementsModule } from './signalements/signalements.module';
import { AmisModule } from './amis/amis.module';
import { MessagerieModule } from './messagerie/messagerie.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UtilisateursModule,
    RessourcesModule,
    CategoriesModule,
    TagsModule,
    CommentairesModule,
    FavorisModule,
    ProgressionsModule,
    SignalementsModule,
    AmisModule,
    MessagerieModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
