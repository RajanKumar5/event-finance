import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import { getAllEvents } from "../api/eventApi";

const EventContext = createContext(null);

export const EventProvider = ({ children }) => {
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [loadingEvents, setLoadingEvents] = useState(true);

    useEffect(() => {
        const loadEvents = async () => {
            try {
                const data = await getAllEvents();

                setEvents(data);

                if (data.length > 0) {
                    setSelectedEventId(data[0].id);
                }
            } catch (error) {
                console.error("Failed to load events", error);
            } finally {
                setLoadingEvents(false);
            }
        };

        loadEvents();
    }, []);

    const selectedEvent =
        events.find(
            (event) => String(event.id) === String(selectedEventId)
        ) || null;

    return (
        <EventContext.Provider
            value={{
                events,
                selectedEventId,
                selectedEvent,
                setSelectedEventId,
                loadingEvents,
            }}
        >
            {children}
        </EventContext.Provider>
    );
};

export const useEvent = () => {
    return useContext(EventContext);
};