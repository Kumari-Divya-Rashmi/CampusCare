import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationService";

import {
  connectSocket,
  disconnectSocket,
} from "../services/socketService";

import "./NotificationBell.css";

const NotificationBell = () => {
  const {
    user,
  } = useAuth();

  const navigate =
    useNavigate();

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [
    panelOpen,
    setPanelOpen,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    realtimeConnected,
    setRealtimeConnected,
  ] = useState(false);

  const loadNotifications =
    async (
      showLoading = false
    ) => {
      if (!user) {
        return;
      }

      try {
        if (showLoading) {
          setLoading(true);
        }

        setError("");

        const data =
          await getMyNotifications();

        setNotifications(
          data.notifications
        );

        setUnreadCount(
          data.unreadCount
        );
      } catch (error) {
        setError(
          error.message
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    };

  useEffect(() => {
    if (!user) {
      setNotifications(
        []
      );

      setUnreadCount(0);

      setPanelOpen(false);

      setRealtimeConnected(
        false
      );

      disconnectSocket();

      return undefined;
    }

    loadNotifications();

    const socket =
      connectSocket();

    const handleConnect =
      () => {
        setRealtimeConnected(
          true
        );

        loadNotifications();
      };

    const handleDisconnect =
      () => {
        setRealtimeConnected(
          false
        );
      };

    const handleConnectError =
      (socketError) => {
        console.error(
          "Socket connection error:",
          socketError.message
        );

        setRealtimeConnected(
          false
        );
      };

    const handleNewNotification =
      (notification) => {
        setNotifications(
          (
            currentNotifications
          ) => {
            const alreadyExists =
              currentNotifications.some(
                (item) =>
                  item._id ===
                  notification._id
              );

            if (
              alreadyExists
            ) {
              return currentNotifications;
            }

            return [
              notification,
              ...currentNotifications,
            ].slice(0, 20);
          }
        );

        if (
          !notification.isRead
        ) {
          setUnreadCount(
            (current) =>
              current + 1
          );
        }
      };

    if (socket) {
      socket.on(
        "connect",
        handleConnect
      );

      socket.on(
        "disconnect",
        handleDisconnect
      );

      socket.on(
        "connect_error",
        handleConnectError
      );

      socket.on(
        "notification:new",
        handleNewNotification
      );

      if (
        socket.connected
      ) {
        setRealtimeConnected(
          true
        );
      }
    }

    const intervalId =
      setInterval(() => {
        loadNotifications();
      }, 30000);

    return () => {
      clearInterval(
        intervalId
      );

      if (socket) {
        socket.off(
          "connect",
          handleConnect
        );

        socket.off(
          "disconnect",
          handleDisconnect
        );

        socket.off(
          "connect_error",
          handleConnectError
        );

        socket.off(
          "notification:new",
          handleNewNotification
        );
      }

      disconnectSocket();

      setRealtimeConnected(
        false
      );
    };
  }, [user]);

  if (!user) {
    return null;
  }

  const getComplaintPath =
    (complaintId) => {
      if (
        user.role ===
        "admin"
      ) {
        return `/admin/complaints/${complaintId}`;
      }

      if (
        user.role ===
        "staff"
      ) {
        return `/staff/complaints/${complaintId}`;
      }

      return `/student/complaints/${complaintId}`;
    };

  const handleToggle =
    async () => {
      const nextOpen =
        !panelOpen;

      setPanelOpen(
        nextOpen
      );

      if (nextOpen) {
        await loadNotifications(
          true
        );
      }
    };

  const handleNotificationClick =
    async (
      notification
    ) => {
      try {
        if (
          !notification.isRead
        ) {
          await markNotificationRead(
            notification._id
          );

          setNotifications(
            (
              currentNotifications
            ) =>
              currentNotifications.map(
                (item) =>
                  item._id ===
                  notification._id
                    ? {
                        ...item,

                        isRead:
                          true,
                      }
                    : item
              )
          );

          setUnreadCount(
            (current) =>
              Math.max(
                current - 1,
                0
              )
          );
        }

        setPanelOpen(
          false
        );

        const complaint =
          notification.complaint;

        const complaintId =
          typeof complaint ===
          "string"
            ? complaint
            : complaint?._id;

        if (
          complaintId
        ) {
          navigate(
            getComplaintPath(
              complaintId
            )
          );
        }
      } catch (error) {
        setError(
          error.message
        );
      }
    };

  const handleMarkAllRead =
    async () => {
      try {
        setError("");

        await markAllNotificationsRead();

        setNotifications(
          (
            currentNotifications
          ) =>
            currentNotifications.map(
              (
                notification
              ) => ({
                ...notification,

                isRead:
                  true,
              })
            )
        );

        setUnreadCount(0);
      } catch (error) {
        setError(
          error.message
        );
      }
    };

  return (
    <div className="notification-wrapper">
      <button
        type="button"
        className="notification-bell-button"
        onClick={
          handleToggle
        }
        aria-label="Notifications"
      >
        <span className="notification-bell-icon">
          🔔
        </span>

        {unreadCount >
          0 && (
          <span className="notification-count">
            {unreadCount >
            99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {panelOpen && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <div>
              <h3>
                Notifications
              </h3>

              <p>
                {unreadCount}{" "}
                unread
              </p>

              <span
                className={
                  realtimeConnected
                    ? "notification-live-status notification-live"
                    : "notification-live-status notification-offline"
                }
              >
                {realtimeConnected
                  ? "● Live"
                  : "● Reconnecting"}
              </span>
            </div>

            {unreadCount >
              0 && (
              <button
                type="button"
                onClick={
                  handleMarkAllRead
                }
              >
                Mark all read
              </button>
            )}
          </div>

          {error && (
            <div className="notification-error">
              {error}
            </div>
          )}

          {loading ? (
            <div className="notification-state">
              Loading...
            </div>
          ) : notifications.length ===
            0 ? (
            <div className="notification-state">
              No notifications
              yet.
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map(
                (
                  notification
                ) => (
                  <button
                    type="button"
                    key={
                      notification._id
                    }
                    className={
                      notification.isRead
                        ? "notification-item"
                        : "notification-item notification-unread"
                    }
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                  >
                    <div className="notification-item-top">
                      <strong>
                        {
                          notification.title
                        }
                      </strong>

                      {!notification.isRead && (
                        <span className="notification-unread-dot" />
                      )}
                    </div>

                    <p>
                      {
                        notification.message
                      }
                    </p>

                    <small>
                      {new Date(
                        notification.createdAt
                      ).toLocaleString()}
                    </small>
                  </button>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;