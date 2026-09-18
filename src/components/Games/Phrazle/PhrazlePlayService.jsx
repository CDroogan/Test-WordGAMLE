import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoginModal from './Modals/LoginModal';
import PhrazlesModal from './Modals/PhrazleScoreModal';
import { isPastePending, markPastePending, clearPastePending } from '../../../utils/pendingPaste';
import { getPhrazlePeriod, isPhrazleGraceActive, getPreviousPhrazlePeriodEnd, formatLocalDateTime, formatDateOnly, markGracePeriodJump } from '../../../utils/gracePeriod';

function PhrazlePlayService({ updateStatsChart}) {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const USER_AUTH_DATA = JSON.parse(localStorage.getItem('auth')) || {};
  const { username: loginUsername, email: loginUserEmail } = USER_AUTH_DATA;
  const userId = USER_AUTH_DATA?.id;
  const [showForm, setShowForm] = useState(() => isPastePending('phrazle'));
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [score, setScore] = useState('');
  const [guessDistribution, setGuessDistribution] = useState([0, 0, 0, 0, 0, 0]);
  const [gameIsWin, setGameIsWin] = useState(false);
  
  const [totalGamesPlayed, setTotalGamesPlayed] = useState(0);
  const [totalWinGames, setTotalWinGames] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lastGroup, setLastGroup] = useState(null);
  const [allGroup, setAllGroup] = useState([]);

  const navigate = useNavigate();

  const handleFormClose = () => {
    clearPastePending('phrazle');
    setShowForm(false);
    setScore('');
  };

  const handleLoginPromptClose = () => {
    setShowLoginPrompt(false);
  };

  const handleShow = (url) => {
    if (!loginUsername || !loginUserEmail) {
        setShowLoginPrompt(true);
        return;
    }
    window.open(url, '_blank');
    markPastePending('phrazle');
    setShowForm(true);
};

//get latest group intraction
useEffect(() => {
  const fetchLastGroup = async () => {
    try {
      const response = await Axios.get(
        `${baseURL}/games/phrazle/get-last-group.php`,
        { params: { user_id: userId } }
      );
      setLastGroup(response.data);
    } catch (error) {
      console.error("Error fetching last group:", error);
    }
  };

  if (userId) {
    fetchLastGroup();
  }
}, [userId]);

//get all group id
useEffect(() => {
	const fetchUserGroups = async () => {
	  try {
	  const response = await Axios.get(`${baseURL}/groups/get-user-groups-data.php`, {
	      params: { user_id: userId },
	  });
	  setAllGroup(response.data);
	  
	  } catch (error) {
	  console.error("Error fetching user joined groups:", error);
	  }
	};

if (userId) fetchUserGroups();
}, [userId]);

const onSubmit = async (event) => {
  event.preventDefault();
  setShowForm(false);

  if (typeof updateStatsChart === 'function') {
    updateStatsChart();
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localDate = new Date();

  // Get current time in ISO format (without 'Z' for UTC)
  const createdAt = localDate.toISOString().slice(0, -1);  // "2024-12-02T10:10:29.476"

  // Get time zone offset in minutes
  const offsetMinutes = localDate.getTimezoneOffset();  // Offset in minutes (positive for behind UTC, negative for ahead)
  const offsetSign = offsetMinutes > 0 ? '-' : '+';  // Determine if it's ahead or behind UTC
  const offsetHours = String(Math.abs(offsetMinutes) / 60).padStart(2, '0');  // Convert minutes to hours and format
  const offsetMinutesStr = String(Math.abs(offsetMinutes) % 60).padStart(2, '0');  // Get the remaining minutes and format

  // Format the offset in +05:30 or -05:30 format
  const offsetFormatted = `${offsetSign}${offsetHours}:${offsetMinutesStr}`;

  // Now adjust the time by adding the time zone offset (this does not affect UTC, it gives the correct local time)
  const adjustedDate = new Date(localDate.getTime() - offsetMinutes * 60 * 1000); // Adjust time by the offset in milliseconds

  // Get the adjusted time in 24-hour format, e.g., "2024-12-02T15:10:29.476"
  const adjustedCreatedAt = adjustedDate.toISOString().slice(0, -1);  // "2024-12-02T15:10:29.476" (24-hour format)

  const period = adjustedDate.getHours() < 12 ? "AM" : "PM";

  // Process the Wordle score and match it against a valid format
  const phrazleScore = score.replace(/[🟩🟨⬜🟪]/g, "");
  const lettersAndNumbersRemoved = phrazleScore.replace(/[a-zA-Z0-9,#.:/\\]/g, "");
  const match = phrazleScore.match(/(\d+|X)\/(\d+)/);

  // If this paste is actually for the previous period (accepted by the
  // modal because we're still within the 3-hour grace window), file it
  // under that period's date instead of "now" - otherwise it would show
  // up as this period's result rather than the period it was actually for.
  const todaysGameNumber = getPhrazlePeriod(localDate).number;
  const isGracePeriodResult = isPhrazleGraceActive(localDate) &&
      !score.includes(String(todaysGameNumber)) &&
      score.includes(String(todaysGameNumber - 1));
  const finalCreatedAt = isGracePeriodResult
      ? formatLocalDateTime(getPreviousPhrazlePeriodEnd(localDate))
      : adjustedCreatedAt;

  // A real Phrazle result is always out of 6, and a win is 1-6 guesses -
  // reject anything else (an out-of-range or garbled number) rather than
  // silently storing an impossible score.
  const totalGuesses = match ? parseInt(match[2], 10) : null;
  const guessesUsed = match ? (match[1] === "X" ? 7 : parseInt(match[1], 10)) : null;
  const isValidResult = match && totalGuesses === 6 &&
      (match[1] === "X" || (guessesUsed >= 1 && guessesUsed <= 6));

  if (isValidResult) {
    try {
      const groupGameMap = (allGroup || []).map(group => ({
            groupId: group.id,
            selectedGame: group.selected_games,
            groupName: group.group_name
          }));

      const isWin = match[1] !== "X" && guessesUsed <= totalGuesses;

      setGameIsWin(isWin);

      const updatedGuessDistribution = [...guessDistribution];
      if (isWin && guessesUsed <= 6) {
        updatedGuessDistribution[guessesUsed - 1] += 1;
      }
      setGuessDistribution(updatedGuessDistribution);

      const phrazleObject = {
        baseURL,
        username: loginUsername,
        useremail: loginUserEmail,
        phrazlescore: score,
        isWin,
        gamleScore:guessesUsed,
        createdAt:finalCreatedAt,
        currentUserTime: finalCreatedAt,
        currentPeriod: period,
        timeZone,
        // groupId:lastGroup?.group_id,
        groups: groupGameMap,
        gameName:"phrazle",
        userId
      };
      const res = await Axios.post(`${baseURL}/games/phrazle/create-score.php`, phrazleObject);

      if (res.data.status === 'success') {
        if (typeof updateStatsChart === 'function') {
          updateStatsChart();
        }
        // Fetch current statistics and update
        const currentStats = await Axios.get(`${baseURL}/games/phrazle/create-statistics.php/${loginUserEmail}`);
        const currentStreak = currentStats.data.currentStreak || 0;
        const streak = isWin ? currentStreak + 1 : 0;
        const TotalGameObject = {
          username: loginUsername,
          useremail: loginUserEmail,
          totalWinGames: isWin ? (currentStats.data.totalWinGames || 0) + 1 : currentStats.data.totalWinGames || 0,
          lastgameisWin: isWin,
          currentStreak: streak,
          guessDistribution: updatedGuessDistribution,
          updatedDate: adjustedCreatedAt
        };


        await updateTotalGamesPlayed(TotalGameObject);
        clearPastePending('phrazle');
        setScore('');
        if (isGracePeriodResult) {
            const prevPeriodEnd = getPreviousPhrazlePeriodEnd(localDate);
            markGracePeriodJump('phrazle', `${formatDateOnly(prevPeriodEnd)}_${prevPeriodEnd.getHours() < 12 ? 'AM' : 'PM'}`);
        }
        navigate("/phrazlestats");
        // const latest_group_id = lastGroup?.group_id;
        // if(latest_group_id){
        //   navigate(`/group/${latest_group_id}/stats/phrazle`);
        // }
        // else{
        //   navigate("/phrazlestats");
        // }

      } else {
        toast.error(res.data.message,{ autoClose: 3000 });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'An unexpected error occurred. Please try submitting again.',{ autoClose: 5000 });
    }
  } else {
    toast.error('Could not read that result. Please make sure you copied the full Phrazle share text, then try again.', { autoClose: 5000 });
  }
};
const updateTotalGamesPlayed = async (TotalGameObject) => {
  
    try {
        await Axios.post(`${baseURL}/games/phrazle/update-statistics.php`, TotalGameObject);
    } catch (err) {
        toast.error('Failed to update total games played',{ autoClose: 3000 });
    }
};

    return (
        <>
            <div className="my-3">
                <Button className="phrazle-btn px-5" onClick={() => handleShow('https://solitaired.com/phrazle')}>
                    Play
                </Button>
            </div>

            <LoginModal showLoginPrompt={showLoginPrompt} handleLoginPromptClose={handleLoginPromptClose} />

            <PhrazlesModal
                showForm={showForm}
                handleFormClose={handleFormClose}
                onSubmit={onSubmit}
                score={score}
                setScore={setScore}
                loginUsername={loginUsername}
            />

           
        </>
    );
}

export default PhrazlePlayService;
