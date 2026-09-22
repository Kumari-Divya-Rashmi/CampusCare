import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  API_BASE_URL,
} from "../config/api";

import {
  createComplaint,
} from "../services/complaintService";

import {
  assignComplaint,
} from "../services/adminService";

import {
  updateComplaintStatus,
} from "../services/staffService";

const mockJsonResponse = (
  data,
  ok = true
) => {
  return {
    ok,

    json:
      async () =>
        data,
  };
};

describe(
  "Student -> Admin -> Staff frontend API workflow",
  () => {
    beforeEach(() => {
      localStorage.setItem(
        "campuscare_token",
        "test-jwt-token"
      );

      global.fetch =
        vi.fn();
    });

    it(
      "creates, assigns, starts and resolves a complaint using the correct APIs",
      async () => {
        fetch
          .mockResolvedValueOnce(
            mockJsonResponse({
              success: true,

              complaint: {
                _id:
                  "complaint-123",

                status:
                  "pending",
              },
            })
          )
          .mockResolvedValueOnce(
            mockJsonResponse({
              success: true,

              complaint: {
                _id:
                  "complaint-123",

                status:
                  "assigned",
              },
            })
          )
          .mockResolvedValueOnce(
            mockJsonResponse({
              success: true,

              complaint: {
                _id:
                  "complaint-123",

                status:
                  "in-progress",
              },
            })
          )
          .mockResolvedValueOnce(
            mockJsonResponse({
              success: true,

              complaint: {
                _id:
                  "complaint-123",

                status:
                  "resolved",
              },
            })
          );

        const image =
          new File(
            [
              "fake-image-data",
            ],

            "evidence.png",

            {
              type:
                "image/png",
            }
          );

        await createComplaint(
          {
            title:
              "Broken classroom fan",

            description:
              "The fan is not working properly.",

            category:
              "classroom",

            priority:
              "high",

            location:
              "Room 302",
          },

          image
        );

        expect(
          fetch
        ).toHaveBeenCalledTimes(
          1
        );

        const [
          createUrl,
          createOptions,
        ] =
          fetch.mock.calls[0];

        expect(
          createUrl
        ).toBe(
          `${API_BASE_URL}/complaints`
        );

        expect(
          createOptions.method
        ).toBe(
          "POST"
        );

        expect(
          createOptions.headers
            .Authorization
        ).toBe(
          "Bearer test-jwt-token"
        );

        expect(
          createOptions.headers[
            "Content-Type"
          ]
        ).toBeUndefined();

        expect(
          createOptions.body
        ).toBeInstanceOf(
          FormData
        );

        expect(
          createOptions.body.get(
            "title"
          )
        ).toBe(
          "Broken classroom fan"
        );

        expect(
          createOptions.body.get(
            "category"
          )
        ).toBe(
          "classroom"
        );

        expect(
          createOptions.body.get(
            "image"
          ).name
        ).toBe(
          "evidence.png"
        );

        await assignComplaint(
          "complaint-123",
          "staff-456"
        );

        const [
          assignUrl,
          assignOptions,
        ] =
          fetch.mock.calls[1];

        expect(
          assignUrl
        ).toBe(
          `${API_BASE_URL}/admin/complaints/complaint-123/assign`
        );

        expect(
          assignOptions.method
        ).toBe(
          "PATCH"
        );

        expect(
          JSON.parse(
            assignOptions.body
          )
        ).toEqual({
          staffId:
            "staff-456",
        });

        await updateComplaintStatus(
          "complaint-123",
          "in-progress"
        );

        const [
          startUrl,
          startOptions,
        ] =
          fetch.mock.calls[2];

        expect(
          startUrl
        ).toBe(
          `${API_BASE_URL}/staff/complaints/complaint-123/status`
        );

        expect(
          startOptions.method
        ).toBe(
          "PATCH"
        );

        expect(
          JSON.parse(
            startOptions.body
          )
        ).toEqual({
          status:
            "in-progress",
        });

        await updateComplaintStatus(
          "complaint-123",
          "resolved"
        );

        const [
          resolveUrl,
          resolveOptions,
        ] =
          fetch.mock.calls[3];

        expect(
          resolveUrl
        ).toBe(
          `${API_BASE_URL}/staff/complaints/complaint-123/status`
        );

        expect(
          JSON.parse(
            resolveOptions.body
          )
        ).toEqual({
          status:
            "resolved",
        });

        expect(
          fetch
        ).toHaveBeenCalledTimes(
          4
        );
      }
    );
  }
);