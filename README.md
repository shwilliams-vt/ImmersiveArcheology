"# ImmersiveArcheology" 

Using:
- Firebase Emulator: https://firebase.google.com/docs/emulator-suite/install_and_configure
- Node JS: https://nodejs.org/en/download/
- Redux 

Node Hosting:
- https://www.codeinwp.com/blog/best-nodejs-hosting/

Setup:
- Download NodeJS
    * Download Redux: npm install @reduxjs/toolkit
    * create app: npx create-react-app my-app --template redux
    * Install actual redux: npm install redux
    * npm start in ./my-app/ to start on localhost:3000
    * modify web server in ./my-app/src
- Download Firebase: npm install -g firebase-tools
    * firebase login
    * firebase init
    * firebase init emulators