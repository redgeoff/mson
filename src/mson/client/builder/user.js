import gql from 'graphql-tag';

const LOG_IN = gql`
  mutation LogIn($username: String!, $password: String!) {
    logIn(auth: { username: $username, password: $password }) {
      token
      user {
        id
        username
        roles
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;

export default class User {
  constructor(client) {
    this._client = client;
  }

  async logIn(props) {
    return this._client.mutate({
      mutation: LOG_IN,
      variables: {
        username: props.username,
        password: props.password
      }
    });
  }
}
