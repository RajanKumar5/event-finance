import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import { getAllEvents } from "../api/eventApi";

const EventContext = createContext(null);

const SELECTED_EVENT_KEY = "selectedEventId";

export const EventProvider = ({ children }) => {
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [loadingEvents, setLoadingEvents] = useState(true);

    const refreshEvents = async () => {
        try {
            setLoadingEvents(true);

            const data = await getAllEvents();

            setEvents(data);

            if (data.length === 0) {
                setSelectedEventId("");
                localStorage.removeItem(SELECTED_EVENT_KEY);
                return;
            }

            const storedEventId =
                localStorage.getItem(SELECTED_EVENT_KEY);

            const currentSelectedEventStillExists =
                data.some(
                    (event) =>
                        String(event.id) ===
                        String(selectedEventId)
                );

            const storedEventStillExists =
                data.some(
                    (event) =>
                        String(event.id) ===
                        String(storedEventId)
                );

            if (
                selectedEventId &&
                currentSelectedEventStillExists
            ) {
                return;
            }

            if (
                storedEventId &&
                storedEventStillExists
            ) {
                setSelectedEventId(storedEventId);
                return;
            }

            setSelectedEventId(data[0].id);

            localStorage.setItem(
                SELECTED_EVENT_KEY,
                data[0].id
            );
        } catch (error) {
            console.error(
                "Failed to load events",
                error
            );
        } finally {
            setLoadingEvents(false);
        }
    };

    useEffect(() => {
        refreshEvents();
    }, []);

    const changeSelectedEvent = (eventId) => {
        setSelectedEventId(eventId);

        localStorage.setItem(
            SELECTED_EVENT_KEY,
            eventId
        );
    };

    const selectedEvent =
        events.find(
            (event) =>
                String(event.id) ===
                String(selectedEventId)
        ) || null;

    return (
        <EventContext.Provider
            value={{
                events,
                selectedEventId,
                selectedEvent,
                setSelectedEventId:
                    changeSelectedEvent,
                loadingEvents,
                refreshEvents,
            }}
        >
            {children}
        </EventContext.Provider>
    );
};

export const useEvent = () => {
    const context = useContext(EventContext);

    if (!context) {
        throw new Error(
            "useEvent must be used inside EventProvider"
        );
    }

    return context;
};