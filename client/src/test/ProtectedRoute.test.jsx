import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  render,
  screen,
} from "@testing-library/react";

import {
  MemoryRouter,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";

import {
  useAuth,
} from "../context/AuthContext";

vi.mock(
  "../context/AuthContext",
  () => ({
    useAuth:
      vi.fn(),
  })
);

const renderProtectedRoute =
  (
    allowedRoles = [
      "admin",
    ]
  ) => {
    return render(
      <MemoryRouter
        initialEntries={[
          "/admin",
        ]}
      >
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute
                allowedRoles={
                  allowedRoles
                }
              >
                <div>
                  Protected Admin
                  Content
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/login"
            element={
              <div>
                Login Destination
              </div>
            }
          />

          <Route
            path="/unauthorized"
            element={
              <div>
                Unauthorized
                Destination
              </div>
            }
          />
        </Routes>
      </MemoryRouter>
    );
  };

describe(
  "ProtectedRoute",
  () => {
    it(
      "shows authentication loading state",
      () => {
        useAuth.mockReturnValue({
          user: null,
          loading: true,
        });

        renderProtectedRoute();

        expect(
          screen.getByText(
            "Checking authentication..."
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "redirects unauthenticated users to login",
      () => {
        useAuth.mockReturnValue({
          user: null,
          loading: false,
        });

        renderProtectedRoute();

        expect(
          screen.getByText(
            "Login Destination"
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "redirects users with the wrong role",
      () => {
        useAuth.mockReturnValue({
          user: {
            role:
              "student",
          },

          loading: false,
        });

        renderProtectedRoute(
          [
            "admin",
          ]
        );

        expect(
          screen.getByText(
            "Unauthorized Destination"
          )
        ).toBeInTheDocument();
      }
    );

    it(
      "renders protected content for an allowed role",
      () => {
        useAuth.mockReturnValue({
          user: {
            role:
              "admin",
          },

          loading: false,
        });

        renderProtectedRoute(
          [
            "admin",
          ]
        );

        expect(
          screen.getByText(
            "Protected Admin Content"
          )
        ).toBeInTheDocument();
      }
    );
  }
);