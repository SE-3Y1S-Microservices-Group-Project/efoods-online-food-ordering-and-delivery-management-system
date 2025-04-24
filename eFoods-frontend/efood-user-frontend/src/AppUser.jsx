import { Outlet } from 'react-router-dom';

function AppUser() {
  return (
    <div>
      {/* Optional: Add Navbar or Layout here */}
      <Outlet />
    </div>
  );
}

export default AppUser;