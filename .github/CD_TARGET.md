# CD Target

The current CD target is GitHub Container Registry (GHCR).

The workflow `.github/workflows/docker.yml` publishes a production Docker image when code reaches:

- `staging`: validation image for homologation.
- `main`: production image and `latest` tag.
- `v*.*.*` tags: release images.

## Published Image

The image name follows this pattern:

```text
ghcr.io/<owner>/<repository>
```

Generated tags include:

- Branch tag, such as `staging` or `main`.
- Commit tag, such as `sha-<commit>`.
- Release tag, such as `v1.0.0`.
- `latest`, only from `main`.

## Environments

Create these GitHub Environments when the repository is published:

- `staging`
- `production`

Recommended production environment rules:

- Require approval before deployment.
- Restrict who can approve production delivery.
- Keep deployment secrets scoped to the environment.

## Next Deploy Adapter

After choosing the hosting target, add one deploy job after `publish-image`:

- VPS with Docker Compose: pull the GHCR image over SSH and run `docker compose up -d`.
- Cloud container service: update the service image tag to the new `sha-<commit>` tag.
- Kubernetes: update the deployment image and wait for rollout status.

Rollback should deploy the previous known-good image tag rather than rebuilding code.
