import request from "supertest";
import { afterAll, beforeEach, describe, it, expect } from "vitest";

import { app } from "../app.js";
import { prisma } from "../lib/prisma.js";
import { registerUser } from "../services/auth.js";

describe("POST /auth/register", () => {
  beforeEach(async () => {
    await prisma.todo.deleteMany();
    await prisma.user.deleteMany();
  });

  it("register a user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@example.com",
        password: "password123",
      })
      .expect(201);

    expect(response.body.id).toEqual(expect.any(Number));
    expect(response.body.email).toBe("test@example.com");
    expect(response.body.createdAt).toEqual(expect.any(String));
    expect(response.body.updatedAt).toEqual(expect.any(String));
    expect(response.body.passwordHash).toBeUndefined();
  });

  it("returns 409 when email already exists", async () => {
    await registerUser({
      email: "test@example.com",
      password: "password123",
    });

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@example.com",
        password: "password456",
      })
      .expect(409);

    expect(response.body).toEqual({
      code: "CONFLICT",
      message: "Email already exists",
    });
  });
});

describe("POST /auth/login", () => {
  beforeEach(async () => {
    await prisma.todo.deleteMany();
    await prisma.user.deleteMany();
  });

  it("logs in a user", async () => {
    await registerUser({
      email: "test@example.com",
      password: "password123",
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "password123",
      })
      .expect(200);

    expect(response.body.user.id).toEqual(expect.any(Number));
    expect(response.body.user.email).toBe("test@example.com");
    expect(response.body.user.createdAt).toEqual(expect.any(String));
    expect(response.body.user.updatedAt).toEqual(expect.any(String));
    expect(response.body.user.passwordHash).toBeUndefined();
    expect(response.body.token).toEqual(expect.any(String));
  });

  it("returns 400 when password is wrong", async () => {
    await registerUser({
      email: "test@example.com",
      password: "password123",
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "wrong-password",
      })
      .expect(400);

    expect(response.body).toEqual({
      code: "INVALID_BODY",
      message: "Invalid email or password",
    });
  });

  it("returns 400 when user does not exist", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "missing@example.com",
        password: "password123",
      })
      .expect(400);

    expect(response.body).toEqual({
      code: "INVALID_BODY",
      message: "Invalid email or password",
    });
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
