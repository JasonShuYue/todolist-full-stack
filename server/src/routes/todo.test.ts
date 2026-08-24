import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { app } from "../app.js";
import { prisma } from "../lib/prisma.js";

let testUserId: number;
let authToken: string;

async function createTestUser() {
  const registerResponse = await request(app).post("/auth/register").send({
    email: "test@example.com",
    password: "password123",
  });

  testUserId = registerResponse.body.id;

  const loginResponse = await request(app).post("/auth/login").send({
    email: "test@example.com",
    password: "password123",
  });

  authToken = loginResponse.body.token;
}

function auth(requestBuilder: request.Test) {
  return requestBuilder.set("Authorization", `Bearer ${authToken}`);
}

describe("GET /todos", () => {
  beforeEach(async () => {
    await prisma.todo.deleteMany();
    await prisma.user.deleteMany();
    await createTestUser();
  });

  it("returns paginated todos", async () => {
    await prisma.todo.createMany({
      data: [
        {
          title: "First todo",
          userId: testUserId,
        },
        {
          title: "Second todo",
          userId: testUserId,
        },
        {
          title: "Third todo",
          userId: testUserId,
        },
      ],
    });

    const response = await auth(
      request(app).get("/todos?page=1&pageSize=2"),
    ).expect(200);

    expect(response.body.items).toHaveLength(2);
    expect(response.body.total).toBe(3);
    expect(response.body.page).toBe(1);
    expect(response.body.pageSize).toBe(2);
    expect(response.body.totalPages).toBe(2);
  });

  it("filters active todos", async () => {
    await prisma.todo.createMany({
      data: [
        {
          title: "Active todo",
          completed: false,
          userId: testUserId,
        },
        {
          title: "Completed todo",
          completed: true,
          userId: testUserId,
        },
      ],
    });

    const response = await auth(
      request(app).get("/todos?status=active"),
    ).expect(200);

    expect(response.body.items).toHaveLength(1);
    expect(response.body.total).toBe(1);
    expect(response.body.items[0].title).toBe("Active todo");
    expect(response.body.items[0].completed).toBe(false);
  });

  it("returns 400 when status is invalid", async () => {
    const response = await request(app)
      .get("/todos?status=invalid")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(400);

    expect(response.body).toEqual({
      code: "INVALID_QUERY",
      message: "Invalid query",
    });
  });
});

describe("POST /todos", () => {
  beforeEach(async () => {
    await prisma.todo.deleteMany();
    await prisma.user.deleteMany();
    await createTestUser();
  });

  it("creates a todo", async () => {
    const response = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Learn route tests",
      })
      .expect(201);

    expect(response.body.title).toBe("Learn route tests");
    expect(response.body.completed).toBe(false);
    expect(response.body.id).toEqual(expect.any(Number));
  });

  it("returns 400 when title is empty", async () => {
    const response = await request(app)
      .post("/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "",
      })
      .expect(400);

    expect(response.body).toEqual({
      code: "INVALID_BODY",
      message: "Title is required",
    });
  });
});

describe("PATCH /todos/:id", () => {
  beforeEach(async () => {
    await prisma.todo.deleteMany();
    await prisma.user.deleteMany();
    await createTestUser();
  });

  it("updates a todo", async () => {
    const todo = await prisma.todo.create({
      data: {
        title: "Old title",
        completed: false,
        userId: testUserId,
      },
    });

    const response = await request(app)
      .patch(`/todos/${todo.id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "New title",
        completed: true,
      })
      .expect(200);

    expect(response.body.id).toBe(todo.id);
    expect(response.body.title).toBe("New title");
    expect(response.body.completed).toBe(true);
  });

  it("returns 400 when id is invalid", async () => {
    const response = await request(app)
      .patch("/todos/abc")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "New title",
      })
      .expect(400);

    expect(response.body).toEqual({
      code: "INVALID_PARAMS",
      message: "Invalid todo id",
    });
  });

  it("returns 400 when update body is empty", async () => {
    const todo = await prisma.todo.create({
      data: {
        title: "Old title",
        userId: testUserId,
      },
    });

    const response = await request(app)
      .patch(`/todos/${todo.id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({})
      .expect(400);

    expect(response.body).toEqual({
      code: "INVALID_BODY",
      message: "Invalid todo update",
    });
  });

  it("returns 404 when todo does not exist", async () => {
    const response = await request(app)
      .patch("/todos/999999")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "New title",
      })
      .expect(404);

    expect(response.body).toEqual({
      code: "TODO_NOT_FOUND",
      message: "Todo not found",
    });
  });
});

describe("DELETE /todos/:id", () => {
  beforeEach(async () => {
    await prisma.todo.deleteMany();
    await prisma.user.deleteMany();
    await createTestUser();
  });

  it("deletes a todo", async () => {
    const todo = await prisma.todo.create({
      data: {
        title: "Todo to delete",
        userId: testUserId,
      },
    });

    await request(app)
      .delete(`/todos/${todo.id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(204);

    const deletedTodo = await prisma.todo.findUnique({
      where: {
        id: todo.id,
      },
    });

    expect(deletedTodo).toBeNull();
  });

  it("returns 400 when id is invalid", async () => {
    const response = await request(app)
      .delete("/todos/abc")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(400);

    expect(response.body).toEqual({
      code: "INVALID_PARAMS",
      message: "Invalid todo id",
    });
  });

  it("returns 404 when todo does not exist", async () => {
    const response = await request(app)
      .delete("/todos/999999")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(404);

    expect(response.body).toEqual({
      code: "TODO_NOT_FOUND",
      message: "Todo not found",
    });
  });
});

describe("todos auth", () => {
  it("returns 401 when token is missing", async () => {
    const response = await request(app).get("/todos").expect(401);

    expect(response.body).toEqual({
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
  });

  it("returns 401 when token is invalid", async () => {
    const response = await request(app)
      .get("/todos")
      .set("Authorization", "Bearer invalid-token")
      .expect(401);

    expect(response.body).toEqual({
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
