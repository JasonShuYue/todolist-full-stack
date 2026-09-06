import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "dev-secret";

console.log('jwtSecret------', jwtSecret);

if (process.env.NODE_ENV === "production" && jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters in production");
}

type TokenPayload = {
  userId: number;
};

export function signToken(userId: number) {
  return jwt.sign(
    {
      userId,
    },
    jwtSecret,
    {
      expiresIn: "7d",
    },
  );
}

export function verifyToken(token: string) {
  try {
    const payload = jwt.verify(token, jwtSecret);

    if (
      typeof payload !== "object" ||
      payload === null ||
      !("userId" in payload) ||
      typeof payload.userId !== "number"
    ) {
      return null;
    }

    return payload as TokenPayload;
  } catch {
    return null;
  }
}
