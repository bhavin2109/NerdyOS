import React, { useState, useMemo } from "react";
import useCalendarStore from "../../store/calendarStore";

const NerdyCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: "",
    time: "",
    description: "",
  });

  const { events, addEvent, updateEvent, deleteEvent } = useCalendarStore();

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const today = new Date();

  const isToday = (day) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const formatDateStr = (day) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${month}-${d}`;
  };

  const getEventsForDay = (day) => {
    const dateStr = formatDateStr(day);
    return events.filter((e) => e.date === dateStr);
  };

  const selectedDateStr = selectedDate ? formatDateStr(selectedDate) : null;
  const selectedEvents = useMemo(() => {
    if (!selectedDateStr) return [];
    return events.filter((e) => e.date === selectedDateStr);
  }, [selectedDateStr, events]);

  const handleDayClick = (day) => {
    setSelectedDate(day);
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setEventForm({ title: "", time: "", description: "" });
    setShowEventModal(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      time: event.time || "",
      description: event.description || "",
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = () => {
    if (!eventForm.title.trim()) return;
    if (editingEvent) {
      updateEvent(editingEvent.id, eventForm);
    } else {
      addEvent({ ...eventForm, date: selectedDateStr });
    }
    setShowEventModal(false);
    setEventForm({ title: "", time: "", description: "" });
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id) => {
    deleteEvent(id);
  };

  const renderDays = () => {
    const totalDays = daysInMonth(currentDate);
    const startDay = firstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before start of month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Days of the month
    for (let i = 1; i <= totalDays; i++) {
      const dayEvents = getEventsForDay(i);
      const hasEvents = dayEvents.length > 0;
      const isSelected = selectedDate === i;

      days.push(
        <div
          key={i}
          onClick={() => handleDayClick(i)}
          className={`h-12 w-12 flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all cursor-pointer relative
            ${
              isToday(i)
                ? "bg-rose-500 text-white shadow-md font-bold"
                : isSelected
                  ? "bg-rose-100 text-rose-700 ring-2 ring-rose-400"
                  : "hover:bg-gray-100 text-gray-700"
            }`}
        >
          {i}
          {hasEvents && (
            <div className="flex gap-0.5 mt-0.5">
              {dayEvents.slice(0, 3).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1 h-1 rounded-full ${isToday(i) ? "bg-white" : "bg-rose-500"}`}
                />
              ))}
            </div>
          )}
        </div>,
      );
    }

    return days;
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-2xl font-bold text-gray-800">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-sm font-bold hover:bg-rose-200 transition-colors"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
          >
            →
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col p-4">
          {/* Weekdays Header */}
          <div className="grid grid-cols-7 gap-1 pb-2 border-b border-gray-100 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-7 gap-y-2 gap-x-1 justify-items-center">
              {renderDays()}
            </div>
          </div>
        </div>

        {/* Events Sidebar */}
        <div className="w-64 border-l border-gray-200 bg-gray-50 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-700">
              {selectedDate
                ? `${monthNames[currentDate.getMonth()]} ${selectedDate}`
                : "Select a day"}
            </h3>
            {selectedDate && (
              <button
                onClick={handleAddEvent}
                className="w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors text-lg font-bold"
              >
                +
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {selectedDate ? (
              selectedEvents.length > 0 ? (
                <div className="space-y-2">
                  {selectedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 truncate">
                            {event.title}
                          </h4>
                          {event.time && (
                            <p className="text-xs text-rose-500 font-medium">
                              {event.time}
                            </p>
                          )}
                          {event.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2 shrink-0">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="text-gray-400 hover:text-blue-500 text-xs"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-gray-400 hover:text-red-500 text-xs"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center mt-8">
                  No events for this day.
                  <br />
                  <button
                    onClick={handleAddEvent}
                    className="text-rose-500 hover:underline mt-2 inline-block"
                  >
                    Add one?
                  </button>
                </p>
              )
            ) : (
              <p className="text-sm text-gray-400 text-center mt-8">
                Click a day to view events
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-80 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editingEvent ? "Edit Event" : "New Event"}
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Event title"
                value={eventForm.title}
                onChange={(e) =>
                  setEventForm({ ...eventForm, title: e.target.value })
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
              <input
                type="time"
                value={eventForm.time}
                onChange={(e) =>
                  setEventForm({ ...eventForm, time: e.target.value })
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
              <textarea
                placeholder="Description (optional)"
                value={eventForm.description}
                onChange={(e) =>
                  setEventForm({ ...eventForm, description: e.target.value })
                }
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
              />
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowEventModal(false)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEvent}
                disabled={!eventForm.title.trim()}
                className="flex-1 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NerdyCalendar;
