import { useState, useEffect } from 'react';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Badge } from 'react-bootstrap';
import moment from 'moment-timezone';
import useDragScroll from '../../hooks/useDragScroll';

// Mirrors GroupInvites.jsx's own filter exactly, so a group muted (or set to
// "game complete only") there is muted here too - the homepage bell's raw
// per-group unread counts don't know about these preferences on their own,
// so skipping this step would show a badge here for something the bell
// itself is deliberately hiding.
const applyMessageFilters = (messages, notificationModes) => {
    return messages.filter(msg => {
        const mode = notificationModes[String(msg.group_id)] || "";
        if (mode === "MUTE_ALL") return false;
        if (mode === "EXCEPT_GAME_COMPLETE") return msg.msg_from === 'game_winner';
        return true;
    });
};

function GroupButtonsRow() {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const userId = USER_AUTH_DATA?.id;
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [notificationModes, setNotificationModes] = useState({});
    const [groupUnread, setGroupUnread] = useState({});
    const { dragScrollRef, dragScrollHandlers } = useDragScroll();

    useEffect(() => {
        if (!userId) return;
        Axios.get(`${baseURL}/groups/get-user-groups-data.php`, { params: { user_id: userId } })
            .then((res) => setGroups(Array.isArray(res.data) ? res.data : []))
            .catch((error) => console.error("Error fetching user groups:", error));
    }, [userId]);

    // Same per-group notification mute/preference settings the homepage
    // bell uses, fetched once the group list is in.
    useEffect(() => {
        if (!Array.isArray(groups) || !groups.length || !userId) return;
        const groupIds = groups.map(g => g.id);
        Axios.get(`${baseURL}/groups/get-notification-preference-message.php`, {
            params: { user_id: userId, group_ids: groupIds }
        })
            .then((res) => setNotificationModes(res.data?.modes || {}))
            .catch((error) => console.error("Error fetching notification preferences:", error));
    }, [groups, userId]);

    // The homepage bell's per-group unread counts (group_unread) don't
    // account for the mute preferences above - it fetches the raw message
    // list and applies that filtering itself. Doing the same here, then
    // counting unread messages per group, so a muted or "game complete
    // only" group's badge here always matches what the bell would show for
    // that group after its own filtering.
    useEffect(() => {
        if (!userId) return;
        const timeZone = moment.tz.guess();
        const today = moment().tz(timeZone).format("YYYY-MM-DD");
        const current_period = moment().tz(timeZone).format("A");

        Axios.get(`${baseURL}/groups/get-group-messages.php`, {
            params: { user_id: userId, today, current_period }
        })
            .then((res) => {
                const messages = Array.isArray(res.data?.messages) ? res.data.messages : [];
                const filtered = applyMessageFilters(messages, notificationModes);
                const counts = {};
                filtered.forEach((msg) => {
                    const isUnread = !msg.seen_ids || !msg.seen_ids.split(',').includes(String(userId));
                    if (isUnread) {
                        counts[msg.group_id] = (counts[msg.group_id] || 0) + 1;
                    }
                });
                setGroupUnread(counts);
            })
            .catch((error) => console.error("Error fetching group unread counts:", error));
    }, [userId, notificationModes]);

    // Clicking a group button here has no per-message list to click through
    // (unlike the homepage bell's dropdown), so the click itself stands in
    // for "I've seen this group's notifications" - it marks every pending
    // message in that group as seen for this user in one call. That write
    // lands in the same seen_ids column the bell reads, so the bell's badge
    // and dropdown drop this group's messages too, without anything special
    // needed to keep the two in sync.
    const handleGroupClick = (groupId) => {
        setGroupUnread((prev) => ({ ...prev, [groupId]: 0 }));
        Axios.post(`${baseURL}/groups/mark-group-seen.php`, {
            group_id: groupId,
            user_id: userId,
        }).catch((error) => console.error("Error marking group notifications seen:", error));
        navigate(`/group/${groupId}/stats`);
    };

    if (groups.length === 0) return null;

    return (
        <div className="group-select-row mb-3" ref={dragScrollRef} {...dragScrollHandlers}>
            {groups.map((group) => {
                const unreadCount = groupUnread[group.id] || 0;
                return (
                    <div key={group.id} className="group-select-btn-wrapper">
                        <button
                            type="button"
                            className="group-select-btn text-center fw-bold py-2 px-3 rounded text-uppercase"
                            onClick={() => handleGroupClick(group.id)}
                        >
                            {group.group_name}
                        </button>
                        {unreadCount > 0 && (
                            <Badge bg="danger" className="notification-count">
                                {unreadCount}
                            </Badge>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default GroupButtonsRow;
