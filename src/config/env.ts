const MIN_SECRET_LENGTH = 32;

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters`
    );
  }

  return secret;
}

export function getPort(): number {
  const port = Number(process.env.PORT ?? 4000);
  return Number.isInteger(port) && port > 0 ? port : 4000;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function assertRequiredEnv(): void {
  getJwtSecret();
}
