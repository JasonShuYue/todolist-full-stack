import request from "supertest";
import { beforeEach, describe, it, expect } from "vitest";

import { app } from "../app.js";
import { prisma } from "../lib/prisma.js";

describe("GET /todos", () => {
  beforeEach(async () => {
    await prisma.todo.deleteMany();
  });

  it("returns paginated todos", async () => {
    await prisma.todo.createMany({
      data: [
        {
          title: "First todo",
        },
        {
          title: "Second todo",
        },
        {
          title: "Third todo",
        },
      ],
    });

    const response = await request(app)
      .get("/todos?page=1&pageSize=2")
      .expect(200);

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
        },
        {
          title: "Completed todo",
          completed: true,
        },
      ],
    });

    const response = await request(app).get("/todos?status=active").expect(200);

    expect(response.body.items).toHaveLength(1);
    expect(response.body.total).toBe(1);
    expect(response.body.items[0].title).toBe("Active todo");
    expect(response.body.items[0].completed).toBe(false);
  });

  it("returns 400 when status is invalid", async () => {
    const response = await request(app)
      .get("/todos?status=invalid")
      .expect(400);

    expect(response.body).toEqual({
      code: "INVALID_QUERY",
      message: "Invalid query",
    });
  });
});
