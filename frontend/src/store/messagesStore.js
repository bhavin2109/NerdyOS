import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useMessagesStore = create(
    persist(
        (set, get) => ({
            contacts: [
                { id: '1', name: 'Team Nerdy', avatar: null },
                { id: '2', name: 'John Doe', avatar: null },
                { id: '3', name: 'Sarah Smith', avatar: null },
            ],
            messages: {
                '1': [
                    { id: '1-1', text: "Hey! Did you see the new OS update?", time: "10:30 AM", isMe: false, sender: "Alice" },
                    { id: '1-2', text: "Yeah, it looks amazing! The glassmorphism is on point.", time: "10:32 AM", isMe: false, sender: "Bob" },
                    { id: '1-3', text: "I'm working on the new Messages app right now.", time: "10:33 AM", isMe: true, sender: "Me" },
                ],
                '2': [
                    { id: '2-1', text: "Meeting at 3 PM?", time: "Yesterday", isMe: false, sender: "John" },
                    { id: '2-2', text: "Sure, see you then.", time: "Yesterday", isMe: true, sender: "Me" },
                ],
                '3': [
                    { id: '3-1', text: "Can you send me the files?", time: "Mon", isMe: false, sender: "Sarah" },
                ],
            },
            activeContactId: '1',

            // Set active contact
            setActiveContact: (contactId) => set({ activeContactId: contactId }),

            // Add a new contact
            addContact: (name) => {
                const id = Date.now().toString();
                set((state) => ({
                    contacts: [...state.contacts, { id, name, avatar: null }],
                    messages: { ...state.messages, [id]: [] },
                }));
                return id;
            },

            // Delete a contact
            deleteContact: (id) => set((state) => {
                const { [id]: _removed, ...remainingMessages } = state.messages;
                return {
                    contacts: state.contacts.filter((c) => c.id !== id),
                    messages: remainingMessages,
                    activeContactId: state.activeContactId === id ? (state.contacts[0]?.id || null) : state.activeContactId,
                };
            }),

            // Add a message to a contact's conversation
            addMessage: (contactId, text) => set((state) => ({
                messages: {
                    ...state.messages,
                    [contactId]: [
                        ...(state.messages[contactId] || []),
                        {
                            id: `${contactId}-${Date.now()}`,
                            text,
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            isMe: true,
                            sender: 'Me',
                        }
                    ]
                }
            })),

            // Get messages for active contact
            getActiveMessages: () => {
                const state = get();
                return state.messages[state.activeContactId] || [];
            },

            // Get active contact details
            getActiveContact: () => {
                const state = get();
                return state.contacts.find((c) => c.id === state.activeContactId);
            },
        }),
        {
            name: 'nerdyos-messages',
        }
    )
);

export default useMessagesStore;
