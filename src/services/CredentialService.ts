import brcypt from "bcrypt";
export class CredentialService {
  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await brcypt.compare(password, hashedPassword);
  }
}
