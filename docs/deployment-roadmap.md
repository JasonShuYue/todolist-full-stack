# 部署与全栈生产化路线

> 面向前端转全栈的渐进式实践路线。目标不是一次性搭建复杂基础设施，而是先理解并掌握：开发、部署、排错、备份、恢复和迭代。

最后更新：2026-10-09

## 当前总体状态

当前项目已经从本地开发进入单服务器生产运行阶段：

- **已完成**：React 前端、Express API、Prisma、SQLite、Docker Compose 基础部署。
- **已完成**：腾讯云轻量服务器部署，宿主机 Nginx 反向代理。
- **已完成**：域名 `jasonshu.cn` 解析、ICP 备案、HTTP 访问和 HTTPS。
- **已完成**：HTTP 自动跳转 HTTPS，生产 `CORS_ORIGIN` 设置为 `https://jasonshu.cn`。
- **已完成**：ICP 备案号展示在网站底部。
- **已完成**：服务器代码切换为 Git 管理，可以通过 `git pull` 更新代码。
- **已完成**：应用通过 Docker image 和 Docker volume 分离代码与 SQLite 数据。
- **待完成**：公安联网备案提交与审核。
- **下一步**：SQLite 备份与恢复演练、基础监控和日志管理。

当前访问链路：

```text
浏览器
  ↓ HTTPS :443
腾讯云服务器宿主机 Nginx
  ↓ 反向代理
127.0.0.1:3000
  ↓
Docker app 容器
  ↓
SQLite Docker volume
```

当前不采用的架构：

```text
Nginx 容器化、PostgreSQL、Redis、CDN、Kubernetes
```

这些方案有实际用途，但暂时不是当前项目的学习重点。

## 已完成的上线步骤

### 基础应用

- React 前端和 Express API 可以独立开发和构建。
- 用户注册、登录和 Todo 增删改查已经可以运行。
- Prisma 连接 SQLite，数据库文件通过 Docker volume 持久化。
- 应用提供 `/health` 和 `/health/ready` 健康检查。

### Docker 和服务器

- 使用 Dockerfile 构建 `todolist-full-stack:local` 镜像。
- 使用 Docker Compose 管理 `app` 服务。
- 使用 `todolist-full-stack_todolist-data` 保存 SQLite 数据。
- 应用端口绑定到服务器本机：

```yaml
ports:
  - "127.0.0.1:3000:3000"
```

- 腾讯云防火墙开放 `22`、`80`、`443`，未对公网开放应用端口。

### 域名、HTTPS 和备案

- `jasonshu.cn` DNS A 记录指向腾讯云轻量服务器公网 IP。
- Nginx `server_name` 已配置为 `jasonshu.cn` 和 `www.jasonshu.cn`。
- HTTPS 证书已签发并部署到宿主机 Nginx。
- HTTP 请求已通过 `301` 跳转到 HTTPS。
- ICP 备案已通过，网站底部已展示：

```text
浙ICP备2026082311号
```

- 公安联网备案数据码已生成，仍需在有效期内提交公安联网备案。

### Git 部署

- 服务器已经从 GitHub clone 项目代码。
- 服务器使用独立 SSH key 拉取 GitHub 仓库。
- 生产 `.env` 保留在服务器，不提交 Git。
- 当前手动发布流程：

```text
本地修改
→ git commit
→ git push
→ 服务器 git pull
→ docker compose up -d --build app
→ 健康检查
```

## 当前阶段：稳定性和可恢复性

这是前端转全栈最值得继续练习的阶段。目标是回答：

```text
服务挂了，我怎么发现？
数据坏了，我怎么恢复？
代码更新失败，我怎么回滚？
```

### 下一步 1：SQLite 备份与恢复演练

状态：**待完成，当前最高优先级**。

需要完成：

1. 备份 Docker volume 中的 SQLite 数据库。
2. 记录备份文件位置和时间。
3. 在测试副本中验证备份可以恢复。
4. 保留至少一份不在 Docker volume 内的备份。

备份不能只停留在“复制文件”，必须做一次恢复验证。

### 下一步 2：基础监控

状态：**待完成**。

先不引入复杂的 Prometheus 或 Grafana，先掌握：

- 定时检查 `https://jasonshu.cn/health/ready`。
- 检查 Docker 容器是否持续运行。
- 查看应用日志和 Nginx 日志。
- 检查服务器磁盘、内存和 CPU。
- 设置 HTTPS 证书到期提醒。

常用排查命令：

```bash
docker compose ps
docker compose logs --tail=100 app
docker stats --no-stream
df -h
free -h
```

### 下一步 3：日志和运行配置

状态：**待完成**。

- 配置 Docker 日志轮转，避免日志占满磁盘。
- 保持生产 `.env` 不进入 Git。
- 保持证书私钥不进入 Git。
- 检查 SSH 登录方式和服务器防火墙。
- 固化部署和回滚记录。

## 下一阶段：CI 和手动 CD

### CI：先自动检查，不立即自动发布

状态：**待完成**。

使用 GitHub Actions 在每次 push 或 Pull Request 时执行：

```text
安装依赖
→ 测试
→ 类型检查
→ 前端构建
→ 后端构建
→ Docker 镜像构建
```

第一版 CI 的目标是阻止明显错误进入主分支。

### 手动 CD：把部署流程脚本化

状态：**待完成**。

将当前命令整理成部署脚本，例如：

```text
检查 Git 状态
→ 拉取代码
→ 构建镜像
→ 重建 app 容器
→ 检查容器状态
→ 检查 /health/ready
→ 失败时输出日志
```

先掌握可重复的手动部署，再考虑 GitHub Actions 自动 SSH 部署。

## 后置阶段：架构升级

### Nginx Docker 化

状态：**暂缓**。

当前宿主机 Nginx 已经稳定工作，没有必要为了“全部容器化”立即改动生产链路。

未来容器化后目标结构：

```text
Nginx 容器 :80/:443
  ↓
app 容器 :3000
  ↓
数据库服务
```

开始前需要先准备证书挂载、Docker 网络、端口迁移和回滚方案。

### PostgreSQL 迁移

状态：**暂缓，按需进行**。

当前单服务器、单实例 Todo 应用继续使用 SQLite 是合理的。以下需求出现后再提高优先级：

- 多实例部署；
- 明显的并发写入；
- 更复杂的数据查询；
- 后台任务、分享、评论或附件；
- 迁移到托管数据库；
- 需要更成熟的数据库备份体系。

迁移流程：

```text
SQLite 备份
→ PostgreSQL 测试库
→ PostgreSQL schema 和 migration
→ 用户与 Todo 数据迁移
→ 功能验证
→ 生产切换
→ 保留 SQLite 回滚副本
```

迁移前需要处理已有 Todo 的 `userId` 归属问题，不能直接删除 SQLite migration 历史后切换。

## 暂时不引入

以下技术先了解用途，不作为当前项目的实践任务：

- Redis；
- COS、CDN 和对象存储；
- 负载均衡和多实例；
- 消息队列；
- Kubernetes/TKE；
- PostgreSQL 高可用集群；
- 微服务拆分。

## 学习目标

当前目标不是成为专业 DevOps，而是能够独立完成一个小型全栈项目的完整生命周期：

```text
能开发
→ 能部署
→ 能配置域名和 HTTPS
→ 能排查故障
→ 能备份和恢复
→ 能安全发布
→ 能逐步扩展
```

推荐实践顺序：

```text
1. SQLite 备份与恢复
2. 基础监控和日志
3. GitHub Actions CI
4. 手动部署脚本
5. 自动 CD 和回滚
6. Nginx Docker 化
7. PostgreSQL 迁移
```
