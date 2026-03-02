import type { RoleUtilisateur, StatutUtilisateur } from '@prisma/client';

export interface SignedInUser {
  idUtilisateur: number;
  nom: string | null;
  prenom: string | null;
  email: string;
  role: RoleUtilisateur;
  statut: StatutUtilisateur;
  dateCreation: Date;
}

export interface SignInResponse {
  data: {
    accessToken: string;
    user: SignedInUser;
  };
}
