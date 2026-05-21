import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { RolesGuard } from './auth/roles.guard';
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
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: Number(process.env.THROTTLE_TTL ?? 60_000),
          limit: Number(process.env.THROTTLE_LIMIT ?? 10),
        },
      ],
    }),
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
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
