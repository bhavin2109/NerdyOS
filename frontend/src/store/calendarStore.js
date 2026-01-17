import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCalendarStore = create(
    persist(
        (set, get) => ({
            events: [],

            // Add a new event
            addEvent: (event) => set((state) => ({
                events: [
                    ...state.events,
                    {
                        id: Date.now().toString(),
                        createdAt: new Date().toISOString(),
                        ...event,
                    }
                ]
            })),

            // Update an existing event
            updateEvent: (id, data) => set((state) => ({
                events: state.events.map((event) =>
                    event.id === id ? { ...event, ...data, updatedAt: new Date().toISOString() } : event
                )
            })),

            // Delete an event
            deleteEvent: (id) => set((state) => ({
                events: state.events.filter((event) => event.id !== id)
            })),

            // Get events for a specific date (YYYY-MM-DD format)
            getEventsForDate: (dateStr) => {
                const events = get().events;
                return events.filter((event) => event.date === dateStr);
            },
        }),
        {
            name: 'nerdyos-calendar',
        }
    )
);

export default useCalendarStore;
