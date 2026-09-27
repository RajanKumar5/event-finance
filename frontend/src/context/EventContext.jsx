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

    useEffect(() => {
        const loadEvents = async () => {
            try {
                const data = await getAllEvents();

                setEvents(data);

                if (data.length === 0) {
                    setSelectedEventId("");
                    return;
                }

                const storedEventId =
                    localStorage.getItem(SELECTED_EVENT_KEY);

                const storedEventStillExists =
                    data.some(
                        (event) =>
                            String(event.id) ===
                            String(storedEventId)
                    );

                if (storedEventId && storedEventStillExists) {
                    setSelectedEventId(storedEventId);
                } else {
                    setSelectedEventId(data[0].id);

                    localStorage.setItem(
                        SELECTED_EVENT_KEY,
                        data[0].id
                    );
                }
            } catch (error) {
                console.error(
                    "Failed to load events",
                    error
                );
            } finally {
                setLoadingEvents(false);
            }
        };

        loadEvents();
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