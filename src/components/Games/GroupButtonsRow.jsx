import { useState, useEffect } from 'react';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Badge } from 'react-bootstrap';
import moment from 'moment-timezone';

function GroupButtonsRow() {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const userId = USER_AUTH_DATA?.id;
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [groupUnread, setGroupUnread] = useState({});

    useEffect(() => {
        if (!userId) return;
        Axios.get(`${baseURL}/groups/get-user-groups-data.php`, { params: { user_id: userId } })
            .then((res) => setGroups(Array.isArray(res.data) ? res.data : []))
            .catch((error) => console.error("Error fetching user groups:", error));
    }, [userId]);

    // Same per-group unread counts the homepage notification bell uses
    // (groups/get-group-messages.php already returns them broken out by
    // group id), so a badge here always matches what the bell would show.
    useEffect(() => {
        if (!userId) return;
        const timeZone = moment.tz.guess();
        const today = moment().tz(timeZone).format("YYYY-MM-DD");
        const current_period = moment().tz(timeZone).format("A");

        Axios.get(`${baseURL}/groups/get-group-messages.php`, {
            params: { user_id: userId, today, current_period }
        })
            .then((res) => setGroupUnread(res.data?.group_unread || {}))
            .catch((error) => console.error("Error fetching group unread counts:", error));
    }, [userId]);

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
        <div className="group-select-row mb-3">
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
