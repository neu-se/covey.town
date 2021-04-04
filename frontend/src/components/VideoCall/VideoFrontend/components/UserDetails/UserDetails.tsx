import React from 'react'
import "./UserDetails.css";
import { useAuth0 } from '@auth0/auth0-react';

const UserDetails = () => {
  const { user, isAuthenticated } = useAuth0();

  if (isAuthenticated) {
    return (
      <div className="userDetails">
        <div title={user.email} className="avatar">
          <img
            src={user.picture}
          />
        </div>
        <div className="userName">
          User: {user.name}
        </div>
      </div>
    );
  }

  return (<div className="userName">Please log in before using covey town</div>);

};

export default UserDetails;
