# Branch Protection

This repository uses three long-lived branches:

- `main`: production and source of truth.
- `staging`: validation and homologation.
- `develop`: development integration.

Configure these rules in GitHub after creating the repository and branches.

## Required Branches

Create the branches in this order:

1. `main`
2. `staging`, from `main`
3. `develop`, from `main`

## `main`

Recommended protection rules:

- Require a pull request before merging.
- Require at least 1 approval.
- Dismiss stale pull request approvals when new commits are pushed.
- Require status checks to pass before merging.
- Require branches to be up to date before merging.
- Require conversation resolution before merging.
- Do not allow direct pushes.
- Do not allow force pushes.
- Do not allow deletions.

Required status checks:

- `Build and unit tests`
- `Validation tests`
- `Docker image build`

## `staging`

Recommended protection rules:

- Require a pull request before merging.
- Require at least 1 approval.
- Require status checks to pass before merging.
- Require branches to be up to date before merging.
- Do not allow direct pushes.
- Do not allow force pushes.
- Do not allow deletions.

Required status checks:

- `Build and unit tests`
- `Validation tests`
- `Docker image build`

## `develop`

Recommended protection rules:

- Require a pull request before merging.
- Require status checks to pass before merging.
- Do not allow force pushes.
- Do not allow deletions.

Required status checks:

- `Build and unit tests`
- `Docker image build`

## Promotion Flow

The promotion workflows create pull requests only after the previous branch CI succeeds:

- `develop` -> `staging`: `.github/workflows/promote-develop-to-staging.yml`
- `staging` -> `main`: `.github/workflows/promote-staging-to-main.yml`

Keep automatic merge disabled for `staging` -> `main` unless the production process is fully mature and rollback is tested.
