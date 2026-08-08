import { useState, useEffect } from 'react';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';

function GroupButtonsRow() {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth'));
    const userId = USER_AUTH_DATA?.id;
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        if (!userId) return;
        Axios.get(`${baseURL}/groups/get-user-groups-data.php`, { params: { user_id: userId } })
            .then((res) => setGroups(Array.isArray(res.data) ? res.data : []))
            .catch((error) => console.error("Error fetching user groups:", error));
    }, [userId]);

    if (groups.length === 0) return null;

    return (
        <div className="group-select-row my-3">
            {groups.map((group) => (
                <button
                    key={group.id}
                    type="button"
                    className="group-select-btn text-center fw-bold py-2 px-3 rounded text-uppercase"
                    onClick={() => navigate(`/group/${group.id}/stats`)}
                >
                    {group.group_name}
                </button>
            ))}
        </div>
    );
}

export default GroupButtonsRow;
