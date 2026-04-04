# Content Worker Deployment

Runs on the Chewy Bytes Hetzner box alongside the PTP worker.

- **Host**: `157.90.168.197`
- **Path**: `/opt/auntie-marlenes`
- **Port**: `3020`
- **Service**: `content-worker.service` (systemd)
- **Runtime**: Bun 1.3+ (installed at `/root/.bun/bin/bun`)

## One-time setup on the box

SSH in as root:

```bash
ssh root@157.90.168.197
```

### 1. Clone the repo

```bash
cd /opt
git clone git@github.com:ezeikel/auntie-marlenes.git
cd auntie-marlenes/apps/content-worker
```

If the box doesn't have an SSH deploy key for this repo yet, either:
- Clone via HTTPS with a GitHub PAT, or
- Add the box's SSH public key as a deploy key in GitHub repo settings.

### 2. Install dependencies

```bash
~/.bun/bin/bun install
```

Sharp and other native binaries will be rebuilt for Linux.

### 3. Copy environment file

Copy your local `apps/content-worker/.env` to the box (from your dev machine):

```bash
scp apps/content-worker/.env root@157.90.168.197:/opt/auntie-marlenes/apps/content-worker/.env
```

Then on the box, add the `WORKER_SECRET` for Bearer auth:

```bash
echo "WORKER_SECRET=$(openssl rand -hex 32)" >> /opt/auntie-marlenes/apps/content-worker/.env
```

Save the secret — you'll need to add it to Vercel as `CONTENT_WORKER_SECRET`.

### 4. Install systemd service

```bash
cp /opt/auntie-marlenes/apps/content-worker/deploy/content-worker.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable content-worker
systemctl start content-worker
systemctl status content-worker
```

### 5. Verify it's running

```bash
curl http://localhost:3020/health
# → {"status":"ok","service":"content-worker"}
```

### 6. Open the firewall (if needed)

The Vercel cron needs to reach port 3020 over the public internet:

```bash
ufw allow 3020/tcp
ufw status
```

**Alternative:** put it behind nginx with a path like `/content-worker/*` → `localhost:3020/*` (more secure, reuses port 80/443).

## Vercel environment variables

Add these to the Vercel project (`apps/web`):

| Name | Value |
|---|---|
| `CONTENT_WORKER_URL` | `http://157.90.168.197:3020` (or nginx URL) |
| `CONTENT_WORKER_SECRET` | The `WORKER_SECRET` from step 3 |
| `CRON_SECRET` | Should already exist for other crons |

## Cron schedule

Defined in `apps/web/vercel.json`:

```json
{ "path": "/api/cron/publish-next", "schedule": "0 12 * * *" }
```

Daily at 12:00 UTC (noon — UK lunchtime scroll window).

## Deployment workflow

Once set up, pushing to `main` with changes under `apps/content-worker/**` will
automatically deploy via `.github/workflows/deploy-content-worker.yml`.

Required GitHub Actions secrets (in the auntie-marlenes repo):
- `HETZNER_HOST` — `157.90.168.197`
- `HETZNER_USER` — `root`
- `HETZNER_SSH_KEY` — private SSH key with access to the box

## Manual operations

```bash
# View logs
journalctl -u content-worker -f

# Restart
systemctl restart content-worker

# Check schedule state
curl -H "Authorization: Bearer $WORKER_SECRET" http://localhost:3020/schedule

# Manually trigger next post (dry run)
curl -X POST http://localhost:3020/publish/next \
  -H "Authorization: Bearer $WORKER_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"dry_run": true}'
```
