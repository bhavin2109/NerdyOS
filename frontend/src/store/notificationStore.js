import { create } from 'zustand';

const useNotificationStore = create((set, get) => ({
    notifications: [],

    addNotification: (notification) => {
        const id = notification.id || Date.now() + Math.random().toString(36).substr(2, 9);
        const duration = notification.duration !== undefined ? notification.duration : 5000; // Default 5s

        set((state) => ({
            notifications: [...state.notifications, { ...notification, id, duration }],
        }));

        if (duration > 0) {
            setTimeout(() => {
                get().removeNotification(id);
            }, duration);
        }
    },

    removeNotification: (id) => {
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        }));
    },
}));

export default useNotificationStore;
