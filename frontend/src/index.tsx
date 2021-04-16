import React from 'react';
import ReactDOM from 'react-dom';
import { Auth0Provider } from "@auth0/auth0-react";
import {ApolloProvider, ApolloClient, InMemoryCache} from '@apollo/client'
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const client = new ApolloClient({
  uri: 'http://localhost:8081/graphql',
  cache: new InMemoryCache()
});

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
    <Auth0Provider
      domain="dev-4h0zl999.us.auth0.com"
      clientId="GOgkbuBOaolbYi8U3FqeJUijEoJAWhUN"
      redirectUri={window.location.origin}
    > 
      <App />
    </Auth0Provider>
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
