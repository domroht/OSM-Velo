import { createBrowserRouter, Outlet } from "react-router";
import { RouterProvider } from "react-router/dom";

import Navbar from "./components/navbar/Navbar";
import HomePage from "./pages/HomePage";

function AppLayout() {
  return (
    <div className="app">
      <Navbar />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

const router = createBrowserRouter([
  {
    Component: AppLayout,
    children: [
      {
        index: true,
        Component: HomePage,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;