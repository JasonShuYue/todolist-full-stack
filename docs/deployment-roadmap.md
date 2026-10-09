# 部署与生产化路线

## 当前状态

- 应用已通过 Docker Compose 部署到腾讯云中国大陆服务器。
- Nginx 已配置反向代理，当前可通过服务器公网 IP 访问 Todo 应用。
- 应用结构：React 前端 + Express API + SQLite + Docker。
- `jasonshu.cn` 已购买，目前处于域名命名审核中。
- 域名、DNS、备案和 HTTPS 尚未完成。

当前访问链路：

```text
浏览器 → Nginx:80 → 127.0.0.1:3000 → Docker app → SQLite
```

## 域名审核期间

1. 通过公网 IP 验证注册、登录、增删改待办和刷新后的数据持久化。
2. 检查 Docker 容器、应用日志和 `/health/ready`。
3. 配置腾讯云安全组和服务器防火墙，只开放 `22`、`80`、`443`。
4. 确认应用端口只绑定本机：`127.0.0.1:3000:3000`。
5. 做 SQLite 数据卷备份和恢复演练。
6. 整理部署文档，准备后续 CI/CD。

## 域名正常后的步骤

```text
域名实名认证
→ ICP 备案
→ DNS A 记录指向服务器 IP
→ Nginx 的 server_name 改为 jasonshu.cn
→ 申请 HTTPS 证书
→ CORS_ORIGIN 改为 https://jasonshu.cn
```

建议添加 DNS 记录：

```text
@     A     服务器公网 IP
www   A     服务器公网 IP
```

## 生产化优化路线

### 第一阶段：稳定和安全

- SSH 密钥登录，限制 SSH 访问。
- 应用端口不直接暴露公网。
- JWT 密钥使用随机长密钥，不使用默认值。
- 配置 Docker 日志轮转、健康检查和资源监控。
- 自动备份数据库，并定期验证恢复。
- 使用 GitHub Actions 等工具实现测试、构建和部署。

### 第二阶段：数据库升级

将 SQLite 迁移到托管 PostgreSQL：

```text
SQLite schema → PostgreSQL schema → 数据迁移 → 备份 → 切换 → 回滚方案
```

迁移前需要处理已有 Todo 的 `userId` 归属问题，并先在测试环境验证。

### 第三阶段：静态资源和文件服务

将前端静态文件部署到 COS，再通过 CDN 分发；API 使用独立域名：

```text
jasonshu.cn       → OSS + CDN → React 静态文件
api.jasonshu.cn   → Nginx → Docker app → PostgreSQL
```

需要同步处理 SPA 路由回退、HTTPS、缓存刷新、API 地址和 CORS。

### 第四阶段：按需扩展

- COS：图片、附件等用户文件。
- Redis：缓存、限流、会话或异步任务。
- 负载均衡和多实例：有明确流量和可用性需求后再引入。
- Kubernetes/TKE：多服务、多实例和团队运维阶段再学习。

## 当前不急于引入

云数据库、对象存储、CDN、Redis、负载均衡和 Kubernetes 都有实际用途，但当前单服务器 Todo 项目优先做好备份、安全、监控和自动发布。

