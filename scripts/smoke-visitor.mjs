// 访客 JWT 端到端冒烟测试：签发 5 分钟令牌，验证点赞 / 评论 / 删除评论
import { SignJWT } from 'jose';

const base = process.env.ABP_API_BASE_URL ?? 'http://localhost:44300';
const secret = new TextEncoder().encode(
  process.env.VISITOR_JWT_SECRET ?? 'please-change-this-visitor-jwt-secret-32chars',
);

const postId = process.argv[2];
if (!postId) {
  console.error('用法: node scripts/smoke-visitor.mjs <postId>');
  process.exit(1);
}

const token = await new SignJWT({
  github_id: '10001',
  github_login: 'smoke-tester',
  name: '冒烟测试',
  picture: null,
  role: 'Visitor',
})
  .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
  .setIssuer('dnhy-space-web')
  .setAudience('dnhy-space-api')
  .setSubject('10001')
  .setIssuedAt()
  .setExpirationTime('5m')
  .sign(secret);

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

async function call(label, path, init) {
  const res = await fetch(base + path, { headers, ...init });
  const text = await res.text();
  console.log(`[${res.status}] ${label} ${path} -> ${text.slice(0, 300)}`);
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

await call('点赞切换', '/api/likes/toggle', {
  method: 'POST',
  body: JSON.stringify({ postId }),
});
await call('点赞状态', `/api/likes/status/${postId}`, { method: 'GET' });

const created = await call('发表评论', '/api/comments', {
  method: 'POST',
  body: JSON.stringify({ postId, content: '来自冒烟测试的评论。' }),
});
await call('评论列表', `/api/comments?PostId=${postId}&MaxResultCount=10`, {
  method: 'GET',
});

if (created.body?.id) {
  await call('删除自己的评论', `/api/comments/${created.body.id}/mine`, {
    method: 'DELETE',
  });
}

await call('访客不能删别人的内容', `/api/posts/${postId}`, { method: 'DELETE' });
await call('匿名不能点赞', '/api/likes/toggle', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ postId }),
});
