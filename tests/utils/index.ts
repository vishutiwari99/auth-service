import { DataSource } from "typeorm";

export const truncateTables = async (connection: DataSource) => {
  const entities = connection.entityMetadatas;
  for (const entity of entities) {
    const repository = connection.getRepository(entity.name);
    await repository.clear();
  }
};

interface JWTHeader {
  typ: string;
  alg: string;
}

export const isJWT = (token: string | null): boolean => {
  if (token === null) return false;
  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  // Decode the header part and parse it as JSON
  const header = JSON.parse(
    Buffer.from(parts[0], "base64").toString("utf8"),
  ) as JWTHeader;
  return header.typ === "JWT" && header.alg !== undefined;
};
