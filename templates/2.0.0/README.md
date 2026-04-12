# Install and run the FrontEnd (for the first time)

## 1- Perquisites

- Make sure you have the Node version 20x+ and npm 10x+ (Update [nodejs download page](https://nodejs.org/en/download/package-manager) if needed!)

## 2- npm Setup

Open a terminal, go to the frontend directory and run:

```bash
cp .npmrc.sample .npmrc
```

Generate a personal access token [How](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic)
Or simply Go to `GitHub` > `Settings` > `Developer settings` > `Personal access tokens` > `Tokens (classic)` > `Generate new token`

**Needed Scopes: repo + write:packages**

Then put your personal access token in the **.npmrc** file

## 3- Install and run in development mode

```bash
npm install
```

If you got error:
`npm ERR! 403 403 Forbidden - GET https://npm.pkg.github.com/download/@metafactory/metafactory-frontend-common/... Permission permission_denied.`
re-check your git token and its scope!

## 4- Run in development mode

```bash
npm run dev
```

## 5- Errors while npm install

If you encountered error `Not Found package`, try:

```bash
npm config set registry https://registry.npmjs.org/
```

- Make sure your database and backend is running!

## Regular updates the FrontEnd

- pull both the `lumina-book-parent` and `frontend-common` repositories
- Add `frontend-common` to the `lumina-book-parent` project as a module, to pull them together

## Requisites for deploying to the AWS

Give the execute permission to the deploy.sh file

```bash
chmod +x deploy-test.sh
```

Create the AWS profile : default

```bash
aws configure
```

## Deploy to TEST

Run the script

```bash
./deploy-test.sh
```
