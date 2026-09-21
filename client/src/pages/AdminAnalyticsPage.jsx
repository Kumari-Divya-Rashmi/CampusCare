import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

import {
  getAdminAnalytics,
} from "../services/adminAnalyticsService";

import "./AdminAnalyticsPage.css";

const STATUS_COLORS = [
  "#f59e0b",
  "#3b82f6",
  "#8b5cf6",
  "#22c55e",
];

const formatText = (value) => {
  if (!value) {
    return "";
  }

  return value
    .replaceAll("-", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
};

const formatResolutionTime = (
  hours
) => {
  if (!hours) {
    return "0 hrs";
  }

  if (hours < 24) {
    return `${hours} hrs`;
  }

  const days = (
    hours / 24
  ).toFixed(1);

  return `${days} days`;
};

const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadAnalytics =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getAdminAnalytics();

        setAnalytics(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="analytics-center-page">
        Loading analytics...
      </div>
    );
  }

  if (
    error &&
    !analytics
  ) {
    return (
      <div className="analytics-center-page">
        <div>
          <h2>
            Unable to load analytics
          </h2>

          <p>{error}</p>

          <button
            onClick={loadAnalytics}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const {
    summary,
    statusBreakdown,
    categoryBreakdown,
    monthlyTrend,
  } = analytics;

  const categoryChartData =
    categoryBreakdown.map(
      (item) => ({
        name: formatText(
          item.category
        ),

        count: item.count,
      })
    );

  const statusChartData =
    statusBreakdown.map(
      (item) => ({
        name: formatText(
          item.status
        ),

        value: item.count,
      })
    );

  return (
    <div className="admin-analytics-page">
      <div className="admin-analytics-container">
        <header className="analytics-header">
          <div>
            <h1>
              CampusCare Analytics
            </h1>

            <p>
              Complaint and service
              performance overview
            </p>
          </div>

          <div className="analytics-header-actions">
            <button
              onClick={
                loadAnalytics
              }
            >
              Refresh
            </button>

            <Link
              to="/admin"
              className="analytics-back-link"
            >
              Back to Complaints
            </Link>
          </div>
        </header>

        {error && (
          <div className="analytics-error">
            {error}
          </div>
        )}

        <section className="analytics-summary-grid">
          <article className="analytics-stat-card">
            <span>
              Total Complaints
            </span>

            <strong>
              {
                summary.totalComplaints
              }
            </strong>
          </article>

          <article className="analytics-stat-card">
            <span>
              Pending
            </span>

            <strong>
              {
                summary.pendingComplaints
              }
            </strong>
          </article>

          <article className="analytics-stat-card">
            <span>
              Assigned
            </span>

            <strong>
              {
                summary.assignedComplaints
              }
            </strong>
          </article>

          <article className="analytics-stat-card">
            <span>
              In Progress
            </span>

            <strong>
              {
                summary.inProgressComplaints
              }
            </strong>
          </article>

          <article className="analytics-stat-card">
            <span>
              Resolved
            </span>

            <strong>
              {
                summary.resolvedComplaints
              }
            </strong>
          </article>

          <article className="analytics-stat-card analytics-critical-card">
            <span>
              Critical Open
            </span>

            <strong>
              {
                summary.criticalOpenComplaints
              }
            </strong>
          </article>

          <article className="analytics-stat-card">
            <span>
              Resolution Rate
            </span>

            <strong>
              {
                summary.resolutionRate
              }
              %
            </strong>
          </article>

          <article className="analytics-stat-card">
            <span>
              Avg. Resolution Time
            </span>

            <strong>
              {formatResolutionTime(
                summary.averageResolutionHours
              )}
            </strong>
          </article>

          <article className="analytics-stat-card">
            <span>
              Average Rating
            </span>

            <strong>
              {
                summary.averageRating
              }
              /5
            </strong>

            <small>
              {
                summary.feedbackCount
              }{" "}
              feedback responses
            </small>
          </article>
        </section>

        <section className="analytics-chart-grid">
          <article className="analytics-chart-card">
            <div className="analytics-chart-heading">
              <h2>
                Complaint Status
              </h2>

              <p>
                Current complaint
                distribution
              </p>
            </div>

            <div className="analytics-chart">
              <ResponsiveContainer
                width="100%"
                height={330}
              >
                <PieChart>
                  <Pie
                    data={
                      statusChartData
                    }
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    label
                  >
                    {statusChartData.map(
                      (
                        entry,
                        index
                      ) => (
                        <Cell
                          key={
                            entry.name
                          }
                          fill={
                            STATUS_COLORS[
                              index %
                                STATUS_COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="analytics-chart-card">
            <div className="analytics-chart-heading">
              <h2>
                Complaints by Category
              </h2>

              <p>
                Issue categories
                reported by students
              </p>
            </div>

            <div className="analytics-chart">
              <ResponsiveContainer
                width="100%"
                height={330}
              >
                <BarChart
                  data={
                    categoryChartData
                  }
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 55,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="name"
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />

                  <YAxis
                    allowDecimals={
                      false
                    }
                  />

                  <Tooltip />

                  <Bar
                    dataKey="count"
                    fill="#2563eb"
                    radius={[
                      5,
                      5,
                      0,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        <section className="analytics-chart-card analytics-wide-chart">
          <div className="analytics-chart-heading">
            <h2>
              Complaint Trend
            </h2>

            <p>
              Complaints created
              during the last six
              months
            </p>
          </div>

          <div className="analytics-chart">
            <ResponsiveContainer
              width="100%"
              height={340}
            >
              <LineChart
                data={monthlyTrend}
                margin={{
                  top: 10,
                  right: 25,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="month"
                />

                <YAxis
                  allowDecimals={false}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={3}
                  activeDot={{
                    r: 7,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="analytics-performance-section">
          <article className="analytics-performance-card">
            <h3>
              Resolution Performance
            </h3>

            <div className="performance-progress">
              <div
                className="performance-progress-bar"
                style={{
                  width: `${Math.min(
                    summary.resolutionRate,
                    100
                  )}%`,
                }}
              />
            </div>

            <div className="performance-row">
              <span>
                Resolution Rate
              </span>

              <strong>
                {
                  summary.resolutionRate
                }
                %
              </strong>
            </div>

            <div className="performance-row">
              <span>
                Resolved Complaints
              </span>

              <strong>
                {
                  summary.resolvedComplaints
                }
              </strong>
            </div>

            <div className="performance-row">
              <span>
                Average Resolution
              </span>

              <strong>
                {formatResolutionTime(
                  summary.averageResolutionHours
                )}
              </strong>
            </div>
          </article>

          <article className="analytics-performance-card">
            <h3>
              Student Satisfaction
            </h3>

            <div className="analytics-rating">
              <span>
                ★
              </span>

              <strong>
                {
                  summary.averageRating
                }
              </strong>

              <small>
                / 5
              </small>
            </div>

            <div className="performance-row">
              <span>
                Feedback Received
              </span>

              <strong>
                {
                  summary.feedbackCount
                }
              </strong>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;