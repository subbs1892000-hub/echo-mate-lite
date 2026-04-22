import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import EmptyState from "../components/EmptyState";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const formatDate = (value) =>
  new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short"
  });

const MessagesPage = () => {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const activeConversation = useMemo(
    () => conversations.find((item) => item._id === conversationId) || null,
    [conversationId, conversations]
  );

  const activeOtherUser = useMemo(() => {
    if (!activeConversation) {
      return null;
    }
    const currentUserId = user?.id || user?._id;
    return activeConversation.participants.find((participant) => participant._id !== currentUserId);
  }, [activeConversation, user]);

  const fetchConversations = async () => {
      try {
        const { data } = await axiosInstance.get("/messages/conversations");
        setConversations(data.items || []);
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to load conversations.", "error");
    }
  };

  const fetchMessages = async (id) => {
    if (!id) {
      setMessages([]);
      return;
    }

    try {
      const { data } = await axiosInstance.get(`/messages/conversations/${id}/messages`);
      setMessages(data.items || []);
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to load messages.", "error");
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      setIsLoading(true);
      await fetchConversations();
      setIsLoading(false);
    };
    bootstrap();
  }, []);

  useEffect(() => {
    fetchMessages(conversationId);
  }, [conversationId]);

  useEffect(() => {
    const username = new URLSearchParams(location.search).get("user");
    if (!username) {
      return;
    }

    const startFromQuery = async () => {
      try {
        const { data } = await axiosInstance.post("/messages/conversations", { username });
        await fetchConversations();
        navigate(`/messages/${data._id}`, { replace: true });
      } catch (error) {
        showToast(error.response?.data?.message || "Unable to start conversation.", "error");
      }
    };

    startFromQuery();
  }, [location.search]);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (!search.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const { data } = await axiosInstance.get("/profile/search", {
          params: { query: search.trim() }
        });
        setSearchResults(data);
      } catch (error) {
        showToast(error.response?.data?.message || "Unable to search users.", "error");
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  const startConversation = async (username) => {
    try {
      const { data } = await axiosInstance.post("/messages/conversations", { username });
      await fetchConversations();
      navigate(`/messages/${data._id}`);
      setSearch("");
      setSearchResults([]);
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to start conversation.", "error");
    }
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!conversationId || !draft.trim()) {
      return;
    }

    try {
      setIsSending(true);
      const { data } = await axiosInstance.post(`/messages/conversations/${conversationId}/messages`, {
        text: draft
      });
      setMessages((prev) => [...prev, data]);
      setDraft("");
      fetchConversations();
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to send message.", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">New chat</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Messages</h2>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="mt-4 w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white"
              placeholder="Search people to start chatting"
            />
            <div className="mt-4 space-y-3">
              {searchResults.map((person) => (
                <button
                  key={person._id}
                  type="button"
                  onClick={() => startConversation(person.username)}
                  className="flex w-full items-center gap-3 rounded-[1.2rem] border border-slate-200 p-3 text-left transition hover:bg-slate-50"
                >
                  <img
                    src={
                      person.profilePicture ||
                      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80"
                    }
                    alt={person.username}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{person.name?.trim() || person.username}</p>
                    <p className="text-sm text-slate-500">@{person.username}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Inbox</p>
            <div className="mt-4 space-y-3">
              {conversations.map((conversation) => {
                const currentUserId = user?.id || user?._id;
                const otherUser = conversation.participants.find((participant) => participant._id !== currentUserId);

                return (
                  <button
                    key={conversation._id}
                    type="button"
                    onClick={() => navigate(`/messages/${conversation._id}`)}
                    className={`flex w-full items-center gap-3 rounded-[1.2rem] border p-3 text-left transition ${
                      conversationId === conversation._id
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <img
                      src={
                        otherUser?.profilePicture ||
                        "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80"
                      }
                      alt={otherUser?.username}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">
                        {otherUser?.name?.trim() || otherUser?.username}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {conversation.lastMessage || "No messages yet"}
                      </p>
                    </div>
                    {conversation.unreadCount ? (
                      <span className="rounded-full bg-brand-600 px-2 py-1 text-xs font-semibold text-white">
                        {conversation.unreadCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}

              {!isLoading && !conversations.length ? (
                <p className="text-sm text-slate-500">No conversations yet. Start one from search.</p>
              ) : null}
            </div>
          </section>
        </aside>

        <section className="rounded-[2rem] border border-slate-200 bg-white shadow-soft">
          {activeConversation && activeOtherUser ? (
            <>
              <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                <img
                  src={
                    activeOtherUser.profilePicture ||
                    "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80"
                  }
                  alt={activeOtherUser.username}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {activeOtherUser.name?.trim() || activeOtherUser.username}
                  </h3>
                  <p className="text-sm text-slate-500">@{activeOtherUser.username}</p>
                </div>
              </div>

              <div className="space-y-4 px-6 py-5">
                {messages.length ? (
                  messages.map((message) => {
                    const isMine = message.sender._id === (user?.id || user?._id);

                    return (
                      <div
                        key={message._id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-[1.4rem] px-4 py-3 ${
                            isMine
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
                          <p
                            className={`mt-2 text-xs ${
                              isMine ? "text-slate-300" : "text-slate-500"
                            }`}
                          >
                            {formatDate(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <EmptyState
                    title="No messages yet"
                    description="Say hello and start the conversation."
                  />
                )}
              </div>

              <form onSubmit={handleSend} className="border-t border-slate-100 px-6 py-5">
                <div className="flex gap-3">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    className="min-h-16 flex-1 rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:bg-white"
                    placeholder="Write a direct message..."
                    maxLength={1000}
                  />
                  <button
                    type="submit"
                    disabled={isSending}
                    className="rounded-[1.2rem] bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSending ? "Sending..." : "Send"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="p-6">
              <EmptyState
                title="Pick a conversation"
                description="Choose an existing chat from the inbox or start a new one using the search panel."
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default MessagesPage;
