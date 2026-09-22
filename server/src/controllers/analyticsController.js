import Complaint from "../models/Complaint.js";
import Feedback from "../models/Feedback.js";

const STATUS_VALUES = [
  "pending",
  "assigned",
  "in-progress",
  "resolved",
];

const CATEGORY_VALUES = [
  "wifi",
  "electricity",
  "water",
  "hostel",
  "classroom",
  "lab",
  "cleanliness",
  "other",
];

const fillBreakdown = (
  values,
  aggregationData,
  keyName
) => {
  const countMap =
    new Map(
      aggregationData.map(
        (item) => [
          item._id,
          item.count,
        ]
      )
    );

  return values.map(
    (value) => ({
      [keyName]:
        value,

      count:
        countMap.get(
          value
        ) || 0,
    })
  );
};

const buildLastSixMonths =
  () => {
    const months = [];

    const now =
      new Date();

    for (
      let offset = 5;
      offset >= 0;
      offset -= 1
    ) {
      const date =
        new Date(
          now.getFullYear(),
          now.getMonth() -
            offset,
          1
        );

      const key =
        `${date.getFullYear()}-${String(
          date.getMonth() +
            1
        ).padStart(
          2,
          "0"
        )}`;

      const label =
        date.toLocaleDateString(
          "en-US",
          {
            month:
              "short",

            year:
              "numeric",
          }
        );

      months.push({
        key,
        label,
      });
    }

    return months;
  };

export const getAdminAnalytics =
  async (req, res) => {
    try {
      const sixMonths =
        buildLastSixMonths();

      const firstMonth =
        sixMonths[0];

      const [
        totalComplaints,
        statusAggregation,
        categoryAggregation,
        criticalOpenComplaints,
        ratingAggregation,
        resolutionAggregation,
        monthlyAggregation,
      ] =
        await Promise.all([
          Complaint.countDocuments(),

          Complaint.aggregate([
            {
              $group: {
                _id:
                  "$status",

                count: {
                  $sum: 1,
                },
              },
            },
          ]),

          Complaint.aggregate([
            {
              $group: {
                _id:
                  "$category",

                count: {
                  $sum: 1,
                },
              },
            },

            {
              $sort: {
                count: -1,
              },
            },
          ]),

          Complaint.countDocuments(
            {
              priority:
                "critical",

              status: {
                $ne:
                  "resolved",
              },
            }
          ),

          Feedback.aggregate([
            {
              $group: {
                _id: null,

                averageRating: {
                  $avg:
                    "$rating",
                },

                feedbackCount: {
                  $sum: 1,
                },
              },
            },
          ]),

          Complaint.aggregate([
            {
              $match: {
                status:
                  "resolved",
              },
            },

            {
              $project: {
                resolvedMoment: {
                  $ifNull: [
                    "$resolvedAt",
                    "$updatedAt",
                  ],
                },

                createdAt: 1,
              },
            },

            {
              $project: {
                resolutionHours: {
                  $divide: [
                    {
                      $subtract: [
                        "$resolvedMoment",
                        "$createdAt",
                      ],
                    },

                    1000 *
                      60 *
                      60,
                  ],
                },
              },
            },

            {
              $group: {
                _id: null,

                averageResolutionHours:
                  {
                    $avg:
                      "$resolutionHours",
                  },
              },
            },
          ]),

          Complaint.aggregate([
            {
              $match: {
                createdAt: {
                  $gte:
                    new Date(
                      `${firstMonth.key}-01T00:00:00.000Z`
                    ),
                },
              },
            },

            {
              $group: {
                _id: {
                  $dateToString:
                    {
                      format:
                        "%Y-%m",

                      date:
                        "$createdAt",
                    },
                },

                count: {
                  $sum: 1,
                },
              },
            },

            {
              $sort: {
                _id: 1,
              },
            },
          ]),
        ]);

      const statusBreakdown =
        fillBreakdown(
          STATUS_VALUES,
          statusAggregation,
          "status"
        );

      const categoryBreakdown =
        fillBreakdown(
          CATEGORY_VALUES,
          categoryAggregation,
          "category"
        );

      const getStatusCount =
        (status) => {
          const item =
            statusBreakdown.find(
              (entry) =>
                entry.status ===
                status
            );

          return (
            item?.count ||
            0
          );
        };

      const pendingComplaints =
        getStatusCount(
          "pending"
        );

      const assignedComplaints =
        getStatusCount(
          "assigned"
        );

      const inProgressComplaints =
        getStatusCount(
          "in-progress"
        );

      const resolvedComplaints =
        getStatusCount(
          "resolved"
        );

      const resolutionRate =
        totalComplaints === 0
          ? 0
          : Number(
              (
                (resolvedComplaints /
                  totalComplaints) *
                100
              ).toFixed(1)
            );

      const averageRating =
        ratingAggregation.length >
        0
          ? Number(
              ratingAggregation[0]
                .averageRating.toFixed(
                  1
                )
            )
          : 0;

      const feedbackCount =
        ratingAggregation.length >
        0
          ? ratingAggregation[0]
              .feedbackCount
          : 0;

      const averageResolutionHours =
        resolutionAggregation.length >
        0
          ? Number(
              resolutionAggregation[0]
                .averageResolutionHours.toFixed(
                  1
                )
            )
          : 0;

      const monthlyCountMap =
        new Map(
          monthlyAggregation.map(
            (item) => [
              item._id,
              item.count,
            ]
          )
        );

      const monthlyTrend =
        sixMonths.map(
          (month) => ({
            month:
              month.label,

            count:
              monthlyCountMap.get(
                month.key
              ) || 0,
          })
        );

      res.status(200).json({
        success: true,

        summary: {
          totalComplaints,

          pendingComplaints,

          assignedComplaints,

          inProgressComplaints,

          resolvedComplaints,

          criticalOpenComplaints,

          resolutionRate,

          averageRating,

          feedbackCount,

          averageResolutionHours,
        },

        statusBreakdown,

        categoryBreakdown,

        monthlyTrend,
      });
    } catch (error) {
      console.error(
        "Admin analytics error:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          "Server error while loading analytics",
      });
    }
  };