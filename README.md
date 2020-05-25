# whack-a-button

Multiplayer, real-time whack-a-mole game built with React, Node.js, and Express. Configured for deployment on Heroku. Built as a learning project for the React stack and socket.io.

The home directory contains the server and the client directory contains the client. 

## To deploy locally:

1) Install node modules by running `node install` in both the home directory and the client directory.

2) Start the server by typing `node server.js` in the home directory. The server should be running on port 8080. If you change the port, make sure to update the proxy setting in /client/package.json so the client can still find the server locally.

3) Start the client by typing `npm start` in the client directory. The client should be running on port 3000.

4) View the website on http://localhost:3000/

## To deploy to heroku:

1) Create a heroku account and install the [heroku cli](https://devcenter.heroku.com/articles/heroku-cli).

2) In the home directory, create a new heroku app with `heroku create <app-name>`.

3) Deploy the app to heroku with `git push heroku`.

4) View the website at the printed address, which should be app-name.herokuapp.com.

## Helpful Resources Used

For socket.io:
- https://www.signet.hr/creating-a-chat-web-app-using-express-js-react-js-socket-io/
- https://medium.com/@ethanryan/making-a-simple-real-time-collaboration-app-with-react-node-express-and-yjs-a261597fdd44
- https://socket.io/get-started/chat/
- https://medium.com/dailyjs/combining-react-with-socket-io-for-real-time-goodness-d26168429a34


For React/Express heroku deployment:
- https://devcenter.heroku.com/articles/getting-started-with-nodejs#deploy-the-app
- https://daveceddia.com/deploy-react-express-app-heroku/
- https://blog.bitsrc.io/react-production-deployment-part-3-heroku-316319744885
