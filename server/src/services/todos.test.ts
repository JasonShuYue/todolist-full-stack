import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "../lib/prisma.js";
import { listTodos } from "./todos.js";

describe("listTodos", () => {
  // 开始之前，将数据库清空
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

    const result = await listTodos({
      status: "all",
      search: "",
      page: 1,
      pageSize: 2,
    });

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(3);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(2);
    expect(result.totalPages).toBe(2);
  });

  it("filters active todos", async () => {
    // 创建测试数据
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

    const result = await listTodos({
      status: "active",
      search: "",
      page: 1,
      pageSize: 10,
    });

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.items[0]?.title).toBe("Active todo");
    expect(result.items[0]?.completed).toBe(false);
  });

  it("filters completed todos", async () => {
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

    const result = await listTodos({
      status: "completed",
      search: "",
      page: 1,
      pageSize: 10,
    });

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.items[0]?.title).toBe("Completed todo");
    expect(result.items[0].completed).toBe(true);
  });

  it("searchs todos by title", async () => {
    await prisma.todo.createMany({
      data: [
        {
          title: "Learn Prisma",
        },
        {
          title: "Learn React",
        },
        {
          title: "Buy milk",
        },
      ],
    });

    const result = await listTodos({
      status: "all",
      search: "Learn",
      page: 1,
      pageSize: 10,
    });

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.items.map((todo) => todo.title).sort()).toEqual([
      "Learn Prisma",
      "Learn React",
    ]);
  });

  it("uses the last page when requested page exceeds total pages", async () => {
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

    const result = await listTodos({
      status: "all",
      search: "",
      page: 99,
      pageSize: 2,
    });

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(3);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(2);
    expect(result.totalPages).toBe(2);
  });

  it("没有 todo 时返回空数组，并且 totalPages 是 0", async () => {
    const result = await listTodos({
      status: "all",
      search: "",
      page: 1,
      pageSize: 10,
    });

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(result.totalPages).toBe(0);
  });
});
