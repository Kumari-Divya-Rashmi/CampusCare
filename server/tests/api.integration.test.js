import {
  describe,
  expect,
  it,
} from "vitest";

import request from "supertest";

import app from "../src/app.js";

import User from "../src/models/User.js";

const createUser = async ({
  name,
  email,
  password = "password123",
  role = "student",
  department = "CSE",
  isActive = true,
}) => {
  return User.create({
    name,
    email,
    password,
    role,
    department,
    isActive,
  });
};

const login = async (
  email,
  password = "password123"
) => {
  const response =
    await request(app)
      .post(
        "/api/auth/login"
      )
      .send({
        email,
        password,
      });

  return response;
};

describe(
  "CampusCare API integration",
  () => {
    it(
      "registers, authenticates and blocks a deactivated student",
      async () => {
        const registerResponse =
          await request(app)
            .post(
              "/api/auth/register"
            )
            .send({
              name:
                "Test Student",

              email:
                "student@test.com",

              password:
                "password123",

              department:
                "CSE",

              role:
                "admin",
            });

        expect(
          registerResponse.status
        ).toBe(201);

        expect(
          registerResponse.body
            .success
        ).toBe(true);

        expect(
          registerResponse.body
            .user.role
        ).toBe(
          "student"
        );

        const loginResponse =
          await login(
            "student@test.com"
          );

        expect(
          loginResponse.status
        ).toBe(200);

        const token =
          loginResponse.body
            .token;

        expect(token).toBeTruthy();

        const profileResponse =
          await request(app)
            .get(
              "/api/auth/me"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            );

        expect(
          profileResponse.status
        ).toBe(200);

        expect(
          profileResponse.body
            .user.email
        ).toBe(
          "student@test.com"
        );

        await User.updateOne(
          {
            email:
              "student@test.com",
          },
          {
            $set: {
              isActive:
                false,
            },
          }
        );

        const blockedResponse =
          await request(app)
            .get(
              "/api/auth/me"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            );

        expect(
          blockedResponse.status
        ).toBe(403);

        expect(
          blockedResponse.body
            .success
        ).toBe(false);
      }
    );

    it(
      "completes the Student -> Admin -> Staff -> Feedback workflow",
      async () => {
        await createUser({
          name:
            "Student One",

          email:
            "student1@test.com",

          role:
            "student",

          department:
            "CSE",
        });

        await createUser({
          name:
            "Campus Admin",

          email:
            "admin@test.com",

          role:
            "admin",

          department:
            "Administration",
        });

        const staffUser =
          await createUser({
            name:
              "Rahul Staff",

            email:
              "staff@test.com",

            role:
              "staff",

            department:
              "Maintenance",
          });

        const studentLogin =
          await login(
            "student1@test.com"
          );

        const adminLogin =
          await login(
            "admin@test.com"
          );

        const staffLogin =
          await login(
            "staff@test.com"
          );

        expect(
          studentLogin.status
        ).toBe(200);

        expect(
          adminLogin.status
        ).toBe(200);

        expect(
          staffLogin.status
        ).toBe(200);

        const studentToken =
          studentLogin.body
            .token;

        const adminToken =
          adminLogin.body
            .token;

        const staffToken =
          staffLogin.body
            .token;

        const createComplaintResponse =
          await request(app)
            .post(
              "/api/complaints"
            )
            .set(
              "Authorization",
              `Bearer ${studentToken}`
            )
            .send({
              title:
                "Broken classroom fan",

              description:
                "The classroom fan is making noise and is not rotating properly.",

              category:
                "classroom",

              priority:
                "critical",

              location:
                "CSE Room 302",
            });

        expect(
          createComplaintResponse.status
        ).toBe(201);

        expect(
          createComplaintResponse.body
            .complaint.status
        ).toBe(
          "pending"
        );

        const complaintId =
          createComplaintResponse
            .body.complaint._id;

        const assignResponse =
          await request(app)
            .patch(
              `/api/admin/complaints/${complaintId}/assign`
            )
            .set(
              "Authorization",
              `Bearer ${adminToken}`
            )
            .send({
              staffId:
                staffUser._id.toString(),
            });

        expect(
          assignResponse.status
        ).toBe(200);

        expect(
          assignResponse.body
            .complaint.status
        ).toBe(
          "assigned"
        );

        expect(
          assignResponse.body
            .complaint
            .assignedTo._id
        ).toBe(
          staffUser._id.toString()
        );

        const staffComplaints =
          await request(app)
            .get(
              "/api/staff/complaints"
            )
            .set(
              "Authorization",
              `Bearer ${staffToken}`
            );

        expect(
          staffComplaints.status
        ).toBe(200);

        expect(
          staffComplaints.body
            .count
        ).toBe(1);

        const startWorkResponse =
          await request(app)
            .patch(
              `/api/staff/complaints/${complaintId}/status`
            )
            .set(
              "Authorization",
              `Bearer ${staffToken}`
            )
            .send({
              status:
                "in-progress",
            });

        expect(
          startWorkResponse.status
        ).toBe(200);

        expect(
          startWorkResponse.body
            .complaint.status
        ).toBe(
          "in-progress"
        );

        const resolveResponse =
          await request(app)
            .patch(
              `/api/staff/complaints/${complaintId}/status`
            )
            .set(
              "Authorization",
              `Bearer ${staffToken}`
            )
            .send({
              status:
                "resolved",
            });

        expect(
          resolveResponse.status
        ).toBe(200);

        expect(
          resolveResponse.body
            .complaint.status
        ).toBe(
          "resolved"
        );

        expect(
          resolveResponse.body
            .complaint
            .resolvedAt
        ).toBeTruthy();

        const commentResponse =
          await request(app)
            .post(
              `/api/complaints/${complaintId}/comments`
            )
            .set(
              "Authorization",
              `Bearer ${studentToken}`
            )
            .send({
              message:
                "The issue is resolved now. Thank you.",
            });

        expect(
          commentResponse.status
        ).toBe(201);

        const feedbackResponse =
          await request(app)
            .post(
              `/api/complaints/${complaintId}/feedback`
            )
            .set(
              "Authorization",
              `Bearer ${studentToken}`
            )
            .send({
              rating: 5,

              comment:
                "The maintenance service was quick and helpful.",
            });

        expect(
          feedbackResponse.status
        ).toBe(201);

        expect(
          feedbackResponse.body
            .feedback.rating
        ).toBe(5);

        const duplicateFeedback =
          await request(app)
            .post(
              `/api/complaints/${complaintId}/feedback`
            )
            .set(
              "Authorization",
              `Bearer ${studentToken}`
            )
            .send({
              rating: 4,
            });

        expect(
          duplicateFeedback.status
        ).toBe(409);

        const studentNotifications =
          await request(app)
            .get(
              "/api/notifications"
            )
            .set(
              "Authorization",
              `Bearer ${studentToken}`
            );

        expect(
          studentNotifications.status
        ).toBe(200);

        const studentNotificationTypes =
          studentNotifications.body
            .notifications.map(
              (
                notification
              ) =>
                notification.type
            );

        expect(
          studentNotificationTypes
        ).toContain(
          "complaint_assigned"
        );

        expect(
          studentNotificationTypes
        ).toContain(
          "work_started"
        );

        expect(
          studentNotificationTypes
        ).toContain(
          "complaint_resolved"
        );

        const staffNotifications =
          await request(app)
            .get(
              "/api/notifications"
            )
            .set(
              "Authorization",
              `Bearer ${staffToken}`
            );

        expect(
          staffNotifications.status
        ).toBe(200);

        expect(
          staffNotifications.body
            .notifications.some(
              (
                notification
              ) =>
                notification.type ===
                "complaint_assigned"
            )
        ).toBe(true);

        const detailsResponse =
          await request(app)
            .get(
              `/api/complaints/${complaintId}/details`
            )
            .set(
              "Authorization",
              `Bearer ${studentToken}`
            );

        expect(
          detailsResponse.status
        ).toBe(200);

        expect(
          detailsResponse.body
            .complaint.status
        ).toBe(
          "resolved"
        );

        expect(
          detailsResponse.body
            .comments
        ).toHaveLength(1);

        expect(
          detailsResponse.body
            .feedback.rating
        ).toBe(5);

        expect(
          detailsResponse.body
            .activities.length
        ).toBeGreaterThanOrEqual(
          5
        );

        const analyticsResponse =
          await request(app)
            .get(
              "/api/admin/analytics"
            )
            .set(
              "Authorization",
              `Bearer ${adminToken}`
            );

        expect(
          analyticsResponse.status
        ).toBe(200);

        expect(
          analyticsResponse.body
            .summary
            .totalComplaints
        ).toBe(1);

        expect(
          analyticsResponse.body
            .summary
            .resolvedComplaints
        ).toBe(1);

        expect(
          analyticsResponse.body
            .summary
            .resolutionRate
        ).toBe(100);

        expect(
          analyticsResponse.body
            .summary
            .averageRating
        ).toBe(5);

        const forbiddenAnalytics =
          await request(app)
            .get(
              "/api/admin/analytics"
            )
            .set(
              "Authorization",
              `Bearer ${studentToken}`
            );

        expect(
          forbiddenAnalytics.status
        ).toBe(403);
      }
    );

    it(
      "lets admin create, deactivate, reactivate and change a staff role",
      async () => {
        await createUser({
          name:
            "Admin User",

          email:
            "admin2@test.com",

          role:
            "admin",
        });

        const adminLogin =
          await login(
            "admin2@test.com"
          );

        const adminToken =
          adminLogin.body
            .token;

        const createStaffResponse =
          await request(app)
            .post(
              "/api/admin/users/staff"
            )
            .set(
              "Authorization",
              `Bearer ${adminToken}`
            )
            .send({
              name:
                "Aman Electrical",

              email:
                "aman@test.com",

              password:
                "staff123",

              department:
                "Electrical Maintenance",
            });

        expect(
          createStaffResponse.status
        ).toBe(201);

        expect(
          createStaffResponse.body
            .user.role
        ).toBe(
          "staff"
        );

        const staffId =
          createStaffResponse.body
            .user.id;

        const staffLogin =
          await login(
            "aman@test.com",
            "staff123"
          );

        expect(
          staffLogin.status
        ).toBe(200);

        const deactivateResponse =
          await request(app)
            .patch(
              `/api/admin/users/${staffId}/status`
            )
            .set(
              "Authorization",
              `Bearer ${adminToken}`
            )
            .send({
              isActive:
                false,
            });

        expect(
          deactivateResponse.status
        ).toBe(200);

        expect(
          deactivateResponse.body
            .user.isActive
        ).toBe(false);

        const blockedLogin =
          await login(
            "aman@test.com",
            "staff123"
          );

        expect(
          blockedLogin.status
        ).toBe(403);

        const activateResponse =
          await request(app)
            .patch(
              `/api/admin/users/${staffId}/status`
            )
            .set(
              "Authorization",
              `Bearer ${adminToken}`
            )
            .send({
              isActive:
                true,
            });

        expect(
          activateResponse.status
        ).toBe(200);

        const roleResponse =
          await request(app)
            .patch(
              `/api/admin/users/${staffId}/role`
            )
            .set(
              "Authorization",
              `Bearer ${adminToken}`
            )
            .send({
              role:
                "student",
            });

        expect(
          roleResponse.status
        ).toBe(200);

        expect(
          roleResponse.body
            .user.role
        ).toBe(
          "student"
        );

        const reloginResponse =
          await login(
            "aman@test.com",
            "staff123"
          );

        expect(
          reloginResponse.status
        ).toBe(200);

        expect(
          reloginResponse.body
            .user.role
        ).toBe(
          "student"
        );
      }
    );
  }
);