export class SignUpDto {
  prenom?: string;
  nom?: string;
  email!: string;
  password!: string;
  repeatPassword!: string;
}
